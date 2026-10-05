import unittest

from app.main import (
    calculate_resume_score,
    clean_text,
    compare_job,
    extract_candidate,
    extract_skills,
)


class ResumeAnalysisTests(unittest.TestCase):
    def test_clean_text_normalizes_whitespace_and_empty_lines(self):
        self.assertEqual(clean_text("  Python   developer \n\n SQL "), "Python developer\nSQL")

    def test_extract_candidate_detects_contact_details_and_name(self):
        candidate = extract_candidate(
            "Abhishek Sharma\nSoftware Developer\nabhishek@example.com\n+91 98765 43210"
        )
        self.assertEqual(candidate["name"], "Abhishek Sharma")
        self.assertEqual(candidate["email"], "abhishek@example.com")
        self.assertTrue(candidate["phone"].endswith("98765 43210"))

    def test_extract_skills_recognizes_technology_names_without_substring_matches(self):
        skills = extract_skills("JavaScript, C++, and SQL experience")
        self.assertIn("JavaScript", skills)
        self.assertIn("C++", skills)
        self.assertIn("SQL", skills)
        self.assertNotIn("Java", skills)
        self.assertNotIn("C", skills)

    def test_job_match_reports_missing_skills_and_percentage(self):
        result = compare_job(
            "Python and SQL projects",
            ["Python", "SQL"],
            {"title": "Data analyst", "description": "Python, SQL, and AWS"},
        )
        self.assertEqual(set(result["matched_skills"]), {"Python", "SQL"})
        self.assertEqual(result["missing_skills"], ["AWS"])
        self.assertGreater(result["match_percentage"], 0)
        self.assertLessEqual(result["match_percentage"], 100)

    def test_resume_score_is_bounded_and_explained_by_its_breakdown(self):
        resume = "Alex Example\nalex@example.com\n+1 555 010 2010\nSkills\nPython\nEducation\nProjects"
        candidate = extract_candidate(resume)
        score, breakdown = calculate_resume_score(resume, candidate, extract_skills(resume))
        self.assertEqual(score, sum(breakdown.values()))
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)

    def test_years_alone_do_not_count_as_a_measurable_achievement(self):
        _, breakdown = calculate_resume_score(
            "Alex Example\nExperience\n2022-2024",
            {"name": "Alex Example", "email": "", "phone": ""},
            [],
        )
        self.assertEqual(breakdown["measurable_achievements"], 0)

    def test_quantified_impact_counts_as_a_measurable_achievement(self):
        _, breakdown = calculate_resume_score(
            "Alex Example\nImproved task completion by 35%",
            {"name": "Alex Example", "email": "", "phone": ""},
            [],
        )
        self.assertEqual(breakdown["measurable_achievements"], 10)

    def test_percentage_counts_as_a_measurable_achievement(self):
        _, breakdown = calculate_resume_score(
            "Alex Example\nCut API latency 35%",
            {"name": "Alex Example", "email": "", "phone": ""},
            [],
        )
        self.assertEqual(breakdown["measurable_achievements"], 10)


if __name__ == "__main__":
    unittest.main()
