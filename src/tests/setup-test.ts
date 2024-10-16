import axios from "axios";
import * as github from "@actions/github";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@actions/github");

const mockGithub = github as jest.Mocked<typeof github>;

// Add octokit mock
const mockCreateComment = jest.fn();
const mockOctokit = {
  rest: {
    issues: {
      createComment: mockCreateComment,
    },
  },
};

// Mock the getOctokit function to return our mockOctokit
mockGithub.getOctokit.mockReturnValue(mockOctokit as any);

export { mockCreateComment, mockOctokit, mockGithub, mockedAxios };
