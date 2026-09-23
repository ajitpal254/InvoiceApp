import serverless from 'serverless-http';
import { app } from '../../server/app.js';
import { connectDB } from '../../server/config/db.js';

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }
  await connectDB();
  return serverlessHandler(event, context);
};
