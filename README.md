# AiMailer

AiMailer is an open source email management platform that allows you to create, send, and track email campaigns using AWS SES.

## Features

- Create and manage email templates with AI assistance
- Send individual and bulk emails
- Track email performance with analytics
- Custom domain verification
- AWS SES integration
- Responsive design with light and dark themes

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB database
- AWS account with SES access

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/aimailer/aimailer.git
   cd aimailer
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file with the following variables:
   \`\`\`
   # AWS SES Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/mail-management

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_jwt_secret
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

AiMailer can be deploye  in your browser.

## Deployment

AiMailer can be deployed to any platform that supports Next.js applications. We recommend using Vercel for the easiest deployment experience.

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure your environment variables
4. Deploy!

## Self-Hosting Considerations

When self-hosting AiMailer, please keep the following in mind:

- You are responsible for securing your own instance and the data it processes
- You should create your own privacy policy and terms of service
- You need to set up your own MongoDB database
- You need to configure your own AWS SES credentials
- You should implement proper authentication and authorization

## Contributing

We welcome contributions to AiMailer! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to contribute.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

AiMailer is open source software licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Contact

- GitHub: [github.com/aimailer/aimailer](https://github.com/aimailer/aimailer)
- Email: support@aimailer.in
- Website: [aimailer.in](https://aimailer.in)

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
- [AWS SES](https://aws.amazon.com/ses/)
