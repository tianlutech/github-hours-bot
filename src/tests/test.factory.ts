import { faker } from "@faker-js/faker";

export const createContext = (data: {
  issue?: Record<string, string>;
  comment?: Record<string, string>;
}) => {
  console.log("CREATED!");
  return {
    payload: {
      issue: {
        id: faker.number.int(),
        number: faker.number.int(),
        title: faker.lorem.sentence(),
        user: { id: faker.number.int(), login: faker.internet.userName() },
        ...(data.issue || {}),
      },
      comment: {
        id: faker.number.int(),
        body: faker.lorem.sentence(),
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
