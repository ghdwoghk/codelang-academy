from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.quiz import Quiz
from app.models.badge import Badge
from app.core.security import hash_password
from app.models.user import User

router = APIRouter(prefix="/api/seed", tags=["Seed Data"])


@router.post("")
def seed_database(db: Session = Depends(get_db)):
    if db.query(Course).first():
        return {"message": "Database already seeded"}

    demo_user = User(
        username="demouser",
        email="demo@example.com",
        password_hash=hash_password("demo1234"),
        xp=250,
        level=3,
    )
    db.add(demo_user)
    db.flush()

    courses_data = [
        Course(
            title="C Programming Fundamentals",
            description="Learn C programming from scratch. Master pointers, memory management, and system programming.",
            language="c",
            difficulty="beginner",
            icon="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
            color="#A8B9CC",
            order_index=1,
            is_published=True,
        ),
        Course(
            title="C++ Object-Oriented Programming",
            description="Dive into C++ with OOP concepts, STL, templates, and modern C++ features.",
            language="cpp",
            difficulty="intermediate",
            icon="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
            color="#00599C",
            order_index=2,
            is_published=True,
        ),
        Course(
            title="HTML & CSS: Web Foundations",
            description="Build beautiful responsive websites from scratch using HTML5 and CSS3.",
            language="html",
            difficulty="beginner",
            icon="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
            color="#E34F26",
            order_index=3,
            is_published=True,
        ),
        Course(
            title="JavaScript: The Complete Guide",
            description="From basics to advanced: closures, promises, async/await, and DOM manipulation.",
            language="javascript",
            difficulty="beginner",
            icon="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
            color="#F7DF1E",
            order_index=4,
            is_published=True,
        ),
        Course(
            title="Python for Everyone",
            description="Python programming for beginners. Covers data structures, algorithms, and more.",
            language="python",
            difficulty="beginner",
            icon="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
            color="#3776AB",
            order_index=5,
            is_published=True,
        ),
    ]

    for course in courses_data:
        db.add(course)
    db.flush()

    lessons_data = []
    for course in courses_data:
        for i in range(3):
            lessons_data.append(Lesson(
                course_id=course.id,
                title=f"{course.title} - Part {i + 1}",
                content=f"""# {course.title} - Part {i + 1}

Welcome to this lesson! In this section, you will learn important concepts about {course.language}.

## Learning Objectives

- Understand the basic syntax of {course.language}
- Write your first {course.language} program
- Learn about variables and data types

## Key Concepts

Programming is the art of telling a computer what to do. Every programming language has its own syntax and rules, but the core concepts remain the same.

### Variables

Variables are containers for storing data values. In most languages, you need to declare a variable before using it.

### Data Types

Common data types include:
- **Integers**: Whole numbers
- **Floats**: Decimal numbers
- **Strings**: Text
- **Booleans**: True/False values

## Try It Yourself!

Write a simple program that prints "Hello, World!" to the console.

```{course.language}
// Your code here
```

Remember: every great programmer started with Hello, World!
""",
                lesson_type="reading" if i == 0 else "code",
                order_index=i,
                xp_reward=10 + i * 5,
                estimated_minutes=5 + i * 3,
                starter_code=f"// Write your {course.language} code here\n#include <stdio.h>\n\nint main() {{\n    printf(\"Hello, World!\\n\");\n    return 0;\n}}" if course.language == "c" else f"// Write your {course.language} code here\n#include <iostream>\n\nint main() {{\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}}" if course.language == "cpp" else f"<!-- Write your {course.language} code here -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>" if course.language == "html" else f"// Write your {course.language} code here\nconsole.log(\"Hello, World!\");" if course.language == "javascript" else f"# Write your {course.language} code here\nprint(\"Hello, World!\")",
                is_free=True,
            ))

    for lesson in lessons_data:
        db.add(lesson)
    db.flush()

    for lesson in lessons_data:
        for j in range(2):
            db.add(Quiz(
                lesson_id=lesson.id,
                question=f"What is the correct way to print to the console in {lesson.title.split(' - ')[0]}?" if j == 0 else f"Which of the following is a valid {lesson.title.split(' - ')[0]} variable declaration?",
                options=[
                    f"Option A for {lesson.title.split(' - ')[0]}",
                    f"Option B for {lesson.title.split(' - ')[0]}",
                    f"Option C for {lesson.title.split(' - ')[0]}",
                    f"Option D for {lesson.title.split(' - ')[0]}",
                ],
                correct_answer=0,
                explanation=f"This is the correct way because {lesson.title.split(' - ')[0]} follows standard syntax conventions.",
                order_index=j,
            ))

    badges_data = [
        Badge(name="First Steps", description="Complete your first lesson", icon_url="🎯"),
        Badge(name="Code Master", description="Complete 10 lessons", icon_url="🏆"),
        Badge(name="Streak King", description="Maintain a 7-day streak", icon_url="🔥"),
        Badge(name="Polyglot", description="Try 3 different languages", icon_url="🌍"),
        Badge(name="Perfect Score", description="Get 100% on any quiz", icon_url="💯"),
    ]
    for badge in badges_data:
        db.add(badge)

    db.commit()
    return {"message": "Database seeded successfully!"}
