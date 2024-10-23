import { faker } from "@faker-js/faker";

export const createContext = (data: {
  issue?: Record<string, string>;
  comment?: Record<string, string>;
}) => {
  return {
    repo: {
      owner: process.env.GITHUB_REPOSITORY?.split("/")[0] || "",
      repo: process.env.GITHUB_REPOSITORY?.split("/")[1] || "",
    },
    payload: {
      issue: {
        id: faker.number.int(),
        number: faker.number.int(),
        title: faker.lorem.sentence(),
        user: { id: faker.number.int(), login: faker.internet.userName() },
        url: faker.internet.url(),
        repository_url: faker.internet.url(),
        ...(data.issue || {}),
      },
      comment: {
        id: faker.number.int(),
        body: faker.lorem.sentence(),
        url: faker.internet.url(),
        updated_at: new Date().toISOString(),
        user: { login: faker.internet.userName(), id: faker.number.int() },
        ...(data.comment || {}),
      },
    },
  };
};

export const seedEnv = (
  data: {
    githubToken?: string;
    webhookUrl?: string;
    githubRepository?: string;
  } = {}
) => {
  process.env.GITHUB_TOKEN = data.githubToken || faker.string.uuid();
  process.env.WEBHOOK_URL = data.webhookUrl || faker.internet.url();
  process.env.GITHUB_REPOSITORY =
    data.githubRepository ||
    `${faker.person.fullName()}/${faker.commerce.productName()}`;
};
