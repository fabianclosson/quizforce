import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { KnowledgeAreaBreakdown } from "@/components/exam/knowledge-area-breakdown";
import { KnowledgeAreaScore } from "@/lib/exam-scoring";

// Mock data for testing
const mockKnowledgeAreaScores: KnowledgeAreaScore[] = [
  {
    id: "ka_1",
    name: "User Management",
    weight_percentage: 20,
    correct_answers: 9,
    total_questions: 12,
    score_percentage: 75,
    performance_level: "good",
  },
  {
    id: "ka_2",
    name: "Data Security",
    weight_percentage: 15,
    correct_answers: 7,
    total_questions: 9,
    score_percentage: 78,
    performance_level: "good",
  },
  {
    id: "ka_3",
    name: "Process Automation",
    weight_percentage: 25,
    correct_answers: 12,
    total_questions: 15,
    score_percentage: 80,
    performance_level: "excellent",
  },
  {
    id: "ka_4",
    name: "Reports and Dashboards",
    weight_percentage: 20,
    correct_answers: 6,
    total_questions: 12,
    score_percentage: 50,
    performance_level: "needs_improvement",
  },
  {
    id: "ka_5",
    name: "Data Management",
    weight_percentage: 20,
    correct_answers: 3,
    total_questions: 12,
    score_percentage: 25,
    performance_level: "poor",
  },
];

describe("KnowledgeAreaBreakdown", () => {
  it("should render the main title", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    expect(screen.getByText("Knowledge Area Performance")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Detailed breakdown of your performance by certification topic"
      )
    ).toBeInTheDocument();
  });

  it("should render all knowledge area names", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(screen.getByText("Data Security")).toBeInTheDocument();
    expect(screen.getByText("Process Automation")).toBeInTheDocument();
    expect(screen.getAllByText("Reports and Dashboards")).toHaveLength(2); // Main list + recommendations
    expect(screen.getAllByText("Data Management")).toHaveLength(2); // Main list + recommendations
  });

  it("should display correct answer counts", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    expect(screen.getByText("9/12 correct")).toBeInTheDocument();
    expect(screen.getByText("7/9 correct")).toBeInTheDocument();
    expect(screen.getByText("12/15 correct")).toBeInTheDocument();
    expect(screen.getByText("6/12 correct")).toBeInTheDocument();
    expect(screen.getByText("3/12 correct")).toBeInTheDocument();
  });

  it("should display performance level badges", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    expect(screen.getAllByText("good")).toHaveLength(2);
    expect(screen.getByText("excellent")).toBeInTheDocument();
    expect(screen.getByText("needs improvement")).toBeInTheDocument();
    expect(screen.getByText("poor")).toBeInTheDocument();
  });

  it("should display progress bars for each area", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars).toHaveLength(mockKnowledgeAreaScores.length);
  });

  it("should show study recommendations section", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    expect(screen.getByText("Study Recommendations")).toBeInTheDocument();
    expect(screen.getAllByText("Priority")).toHaveLength(2); // Two areas need improvement
  });

  it("should display summary statistics labels", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    expect(screen.getByText("Total Areas")).toBeInTheDocument();
    expect(screen.getByText("Strong Areas")).toBeInTheDocument();
    expect(screen.getByText("Need Review")).toBeInTheDocument();
    expect(screen.getByText("Weak Areas")).toBeInTheDocument();
  });

  it("should show detailed recommendations for weak areas", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    expect(screen.getByText("(25% - 20% of exam)")).toBeInTheDocument(); // Data Management
    expect(screen.getByText("(50% - 20% of exam)")).toBeInTheDocument(); // Reports and Dashboards
  });

  it("should display appropriate recommendation text", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    expect(
      screen.getByText("Outstanding! You've mastered this area.")
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Great job! Minor review recommended.")
    ).toHaveLength(2);
    expect(
      screen.getByText("Focus more study time on this area.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Significant improvement needed. Consider additional resources."
      )
    ).toBeInTheDocument();
  });

  it("should handle empty knowledge areas gracefully", () => {
    render(<KnowledgeAreaBreakdown knowledgeAreaScores={[]} />);

    expect(screen.getByText("Knowledge Area Performance")).toBeInTheDocument();
    expect(screen.getByText("Total Areas")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Excellent performance across all knowledge areas! Consider taking the real certification exam."
      )
    ).toBeInTheDocument();
  });

  it("should apply custom className when provided", () => {
    const { container } = render(
      <KnowledgeAreaBreakdown
        knowledgeAreaScores={mockKnowledgeAreaScores}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should display weight information correctly", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    // Check for weight indicators in the component
    expect(screen.getByText("Weight: 25%")).toBeInTheDocument(); // Process Automation
    expect(screen.getByText("Weight: 15%")).toBeInTheDocument(); // Data Security
  });

  it("should display summary statistics correctly", () => {
    render(
      <KnowledgeAreaBreakdown knowledgeAreaScores={mockKnowledgeAreaScores} />
    );

    // Check summary statistics - use getAllByText for duplicated values
    expect(screen.getByText("5")).toBeInTheDocument(); // Total Areas
    expect(screen.getByText("3")).toBeInTheDocument(); // Strong Areas (excellent + good)
    expect(screen.getAllByText("1")).toHaveLength(2); // Need Review (1) + Weak Areas (1)

    expect(screen.getByText("Total Areas")).toBeInTheDocument();
    expect(screen.getByText("Strong Areas")).toBeInTheDocument();
    expect(screen.getByText("Need Review")).toBeInTheDocument();
    expect(screen.getByText("Weak Areas")).toBeInTheDocument();
  });
});
