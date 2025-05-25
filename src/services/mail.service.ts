import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Password Reset Request',
      html: `
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Restablecer contraseña</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f7;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333333;
              font-size: 24px;
              margin-bottom: 20px;
            }
            p {
              color: #555555;
              font-size: 16px;
              line-height: 1.6;
            }
            .btn {
              display: inline-block;
              padding: 14px 22px;
              margin-top: 25px;
              background-color: #0069d9;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              transition: background-color 0.3s ease;
            }
            .btn:hover {
              background-color: #0056b3;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #999999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>¿Olvidaste tu contraseña?</h1>
            <p>
              Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.
            </p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="btn">Restablecer contraseña</a>
            </p>
            <p>
              Si no realizaste esta solicitud, puedes ignorar este correo. Tu contraseña seguirá siendo la misma.
            </p>
            <p class="footer">
              &copy; ${new Date().getFullYear()} | Todos los derechos reservados
            </p>
          </div>
        </body>
      </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
