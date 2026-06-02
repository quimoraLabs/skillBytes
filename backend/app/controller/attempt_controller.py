import uuid
from datetime import datetime, timezone
from fastapi import HTTPException
from app.config.db import get_collection
from app.schemas.attempt_controller import StartAttemptPayload, SubmitAttemptPayload
from app.controller.quiz_controller import get_current_quiz_details_logic
from app.utils.db_helpers import generate_semantic_id

# ---------------------------------------------------------------------
# FLOW 1: START THE TEST
# ---------------------------------------------------------------------
async def start_test_attempt_logic(payload: StartAttemptPayload):
    """
    Initializes a new quiz attempt session, saves the initial log,
    and returns a secured layout of questions without answers.
    """
    # 1. Verify if the target quiz exists in the system
    quiz = await get_collection("quizzes").find_one({"quiz_id": payload.quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    # 2. Generate a structural semantic ID for tracking the session
    attempt_id = generate_semantic_id(
        prefix="attempt", 
        content_value=f"{payload.student_id}_{payload.quiz_id}_{datetime.now().isoformat()}"
    )
    
    # 3. Construct the initial state document for the attempt log
    attempt_doc = {
        "attempt_id": attempt_id,
        "quiz_id": payload.quiz_id,
        "student_id": payload.student_id,
        "start_time": datetime.now(timezone.utc), 
        "total_duration_minutes": quiz.get("duration_minutes", 30),
        "status": "In-Progress",
        "responses": []
    }
    
    # 4. Save the log state inside the tracking database
    await get_collection("test_attempts").insert_one(attempt_doc)
    
    # 5. Fetch secure layout of questions using the dedicated logic utility
    quiz_questions = await get_current_quiz_details_logic(payload.quiz_id) 
    
    return {
        "attempt_id": attempt_doc["attempt_id"],
        "start_time": attempt_doc["start_time"],
        "total_duration_minutes": attempt_doc["total_duration_minutes"],
        "quiz_details": quiz_questions
    }

# ---------------------------------------------------------------------
# FLOW 2: SUBMIT THE TEST
# ---------------------------------------------------------------------
async def submit_test_attempt_logic(payload: SubmitAttemptPayload):
    """
    Evaluates student responses against official answers, validates 
    timers, calculates marks, and closes out the active session.
    """
    # 1. Fetch and validate the active attempt session log
    attempt = await get_collection("test_attempts").find_one({"attempt_id": payload.attempt_id})
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt session not found")
    if attempt["status"] == "Completed":
        raise HTTPException(status_code=400, detail="Test already submitted")

    end_time = datetime.now(timezone.utc)
    
    # Normalize datetime instances across variations to guarantee reliable calculations
    start_time = attempt["start_time"].replace(tzinfo=timezone.utc) if attempt["start_time"].tzinfo is None else attempt["start_time"]
    
    # 2. Strict backend verification of runtime constraints
    time_taken_seconds = (end_time - start_time).total_seconds()
    allowed_seconds = (attempt["total_duration_minutes"] * 60) + 60 
    
    status_flag = "Completed"
    if time_taken_seconds > allowed_seconds:
        status_flag = "Timeout"

    # 3. Fetch absolute truth questions layout from database
    real_questions_cursor = get_collection("questions").find({"quiz_id": attempt["quiz_id"]})
    real_questions = await real_questions_cursor.to_list(length=100)
    questions_map = {q["question_id"]: q for q in real_questions}

    # ⚠️ FIXED: Calculate total possible marks objectively based on DB blueprint, not incoming answers list
    total_marks_possible = sum(q.get("marks", 1) for q in real_questions)
    
    score_obtained = 0
    saved_responses = []

    # 4. Process incoming payload interaction array
    for res in payload.responses:
        q_id = res.question_id
        student_ans = res.selected_option
        is_skipped = res.is_skipped
        
        if q_id in questions_map:
            db_question = questions_map[q_id]
            q_marks = db_question.get("marks", 1)
            
            # Map structural status if the item was passed as skipped or omitted entirely
            if is_skipped or not student_ans:
                saved_responses.append({
                    "question_id": q_id,
                    "selected_option": None,
                    "status": "Skipped"
                })
                continue 
                
            # Locate the official correct target structure within the options array
            correct_option_obj = next(
                (opt for opt in db_question.get("options", []) if opt.get("isCorrect") is True), 
                None
            )
            
            is_correct = False
            if correct_option_obj and correct_option_obj.get("text") == student_ans:
                score_obtained += q_marks
                is_correct = True
                
            saved_responses.append({
                "question_id": q_id,
                "selected_option": student_ans,
                "status": "Correct" if is_correct else "Incorrect"
            })

    # 5. Compile payload updates and write modifications back to database
    update_data = {
        "end_time": end_time,
        "status": status_flag,
        "responses": saved_responses,
        "total_marks_possible": total_marks_possible,
        "total_marks_obtained": score_obtained
    }
    
    await get_collection("test_attempts").update_one(
        {"attempt_id": payload.attempt_id}, 
        {"$set": update_data}
    )

    return {
        "attempt_id": payload.attempt_id,
        "status": status_flag,
        "start_time": start_time,
        "end_time": end_time,
        "total_marks_possible": total_marks_possible,
        "total_marks_obtained": score_obtained,
        "time_taken_seconds": round(time_taken_seconds)
    }

# ---------------------------------------------------------------------
# FLOW 3: GET LEADERBOARD
# ---------------------------------------------------------------------
async def get_quiz_leaderboard_logic(quiz_id: str, limit: int = 10):
    """
    Fetches the top performing students for a specific quiz.
    Implements the Standard Competition Ranking (1-2-2-4 rule) for ties.
    """
    # 1. MongoDB aggregation pipeline to filter and sort attempts
    pipeline = [
        # Filter for completed or timed-out test attempts for this specific quiz
        {"$match": {"quiz_id": quiz_id, "status": {"$in": ["Completed", "Timeout"]}}},
        
        # Sort primarily by marks obtained in descending order
        {"$sort": {"total_marks_obtained": -1}},
        
        # Limit the leaderboard results to the specified count
        {"$limit": limit},
        
        # Project only the fields required by the frontend layout
        {
            "$project": {
                "_id": 0,
                "attempt_id": 1,
                "student_id": 1,
                "total_marks_obtained": 1,
                "total_marks_possible": 1,
                "status": 1
            }
        }
    ]
    
    cursor = get_collection("test_attempts").aggregate(pipeline)
    leaderboard_data = await cursor.to_list(length=limit)
    
    # 2. Compute dynamic Standard Competition Ranking (1-2-2-4 rule)
    current_rank = 1
    previous_score = None
    
    for index, student in enumerate(leaderboard_data):
        current_score = student.get("total_marks_obtained", 0)
        
        # If the current score is strictly less than the previous score, 
        # jump the rank pointer to match the structural index position
        if previous_score is not None and current_score < previous_score:
            current_rank = index + 1
            
        student["rank"] = current_rank
        previous_score = current_score  # Update the anchor score for the next iteration
        
    return {
        "quiz_id": quiz_id,
        "leaderboard": leaderboard_data
    }

# ---------------------------------------------------------------------
# FLOW 4: GET STUDENT TEST REPORT
# ---------------------------------------------------------------------
async def get_student_test_report_logic(student_id: str):
    """
    Fetches all quiz history and detailed metrics for a specific student.
    """
    # ⚠️ FIXED: Updated the structural comments within this code block to standard English
    cursor = get_collection("test_attempts").find(
        {"student_id": student_id},
        {"_id": 0, "responses": 0}  # Omit the inner detailed responses to optimize summary payload sizes
    ).sort("start_time", -1)  # Sort results dynamically ensuring the latest attempts appear first
    
    attempts_history = await cursor.to_list(length=500)
    
    # Dynamic metrics calculation for dashboard highlights
    total_tests_attempted = len(attempts_history)
    completed_tests = sum(1 for att in attempts_history if att.get("status") == "Completed")
    timeout_tests = sum(1 for att in attempts_history if att.get("status") == "Timeout")
    
    return {
        "student_id": student_id,
        "summary": {
            "total_tests_attempted": total_tests_attempted,
            "completed_successfully": completed_tests,
            "timed_out": timeout_tests
        },
        "history": attempts_history
    }