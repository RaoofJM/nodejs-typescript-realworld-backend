import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

const transporterDetails = smtpTransport({
  host: "",
  port: 465,
  secure: true,
  auth: {
    user: "",
    pass: "",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async (
  email: string,
  fullname: string,
  subject: string,
  message: string
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport(transporterDetails);
    await transporter.sendMail({
      from: "",
      to: email,
      subject: subject,
      html: `<h1> Hello ${fullname} </h1>
               <p> ${message} </p>`,
    });

    return true;
  } catch (err) {
    return false;
  }
};
