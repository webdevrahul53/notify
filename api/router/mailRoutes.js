import express from 'express';
import { sendTestMail } from '../controller/mailController';

const mailRouter = express.Router()

mailRouter.post('/', sendTestMail)

export default mailRouter