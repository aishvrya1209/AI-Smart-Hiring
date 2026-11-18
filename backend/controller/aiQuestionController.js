

const mongoose = require("mongoose");

const Question = require("../models/question");
const Round = require("../models/round");
const PlacementDrive = require("../models/placementDrive");
const TestConfiguration = require("../models/testConfiguration");

const generateQuestions = require("../services/aiquestionservice");

const generateAIQuestions = async (req, res) => {
  try {
    const { driveId, roundId } = req.body;
    const companyId = req.user.id;

    // 1. Validate required IDs
    if (!driveId || !roundId) {
      return res.status(400).json({
        success: false,
        message: "Please provide driveId and roundId"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(driveId) ||
      !mongoose.Types.ObjectId.isValid(roundId) ||
      !mongoose.Types.ObjectId.isValid(companyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid driveId, roundId or companyId"
      });
    }

    // 2. Verify company owns the placement drive
    const drive = await PlacementDrive.findOne({
      _id: driveId,
      companyId
    });

    if (!drive) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this placement drive"
      });
    }

    // 3. Verify round belongs to this drive
    const round = await Round.findOne({
      _id: roundId,
      driveId
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Interview round not found for this placement drive"
      });
    }

    // 4. Fetch saved test configuration
    const configuration = await TestConfiguration.findOne({
      driveId,
      roundId,
      companyId
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: "Test configuration not found. Configure the test first."
      });
    }

    // 5. Validate saved configuration
    if (
      !Array.isArray(configuration.topics) ||
      configuration.topics.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No topics found in test configuration"
      });
    }

    const configuredCount = configuration.topics.reduce(
      (sum, topic) => sum + Number(topic.questionCount),
      0
    );

    if (configuredCount !== configuration.totalQuestions) {
      return res.status(400).json({
        success: false,
        message: "Topic question distribution does not match totalQuestions"
      });
    }

    // 6. Generate questions topic-wise
    let allQuestions = [];

    for (const topic of configuration.topics) {
      const topicQuestions = await generateQuestions({
        role: drive.jobRole,
        round: configuration.category,
        difficulty: configuration.difficulty,
        count: topic.questionCount,
        topics: [topic.name]
      });

      if (
        !Array.isArray(topicQuestions) ||
        topicQuestions.length !== topic.questionCount
      ) {
        throw new Error(
          `AI generated incorrect question count for topic: ${topic.name}`
        );
      }

      // Ensure every question is associated with its configured topic
      const questionsWithTopic = topicQuestions.map((q) => ({
        ...q,
        topic: topic.name
      }));

      allQuestions.push(...questionsWithTopic);
    }

    // 7. Final question count validation
    if (allQuestions.length !== configuration.totalQuestions) {
      throw new Error("Generated question count does not match configuration");
    }

    // 8. Prepare question documents
    const questionDocuments = allQuestions.map((q) => ({
      driveId,
      roundId,
      companyId,

      questionText: q.questionText,
      questionType: "MCQ",
      category: configuration.category,
      topic: q.topic,
      difficulty: configuration.difficulty,

      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,

      marks: configuration.marksPerQuestion,
      negativeMarks: configuration.negativeMarks,

      source: "AI",
      status: "DRAFT"
    }));

    // 9. Save questions in MongoDB
    const savedQuestions = await Question.insertMany(
      questionDocuments
    );

    // 10. Success response
    return res.status(201).json({
      success: true,
      message: "AI questions generated using test configuration",
      totalQuestions: savedQuestions.length,
      testConfiguration: {
        title: configuration.title,
        category: configuration.category,
        difficulty: configuration.difficulty,
        durationMinutes: configuration.durationMinutes,
        totalQuestions: configuration.totalQuestions,
        totalMarks: configuration.totalMarks,
      },
      driveId,
      roundId,
      questions: savedQuestions
    });

  } catch (error) {
    console.error("AI Question Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate questions"
    });
  }
};

module.exports = {
  generateAIQuestions
};
