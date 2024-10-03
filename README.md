# AI-Powered Training Plan Manager

## Overview

AI-Powered Training Plan Manager is a Next.js application that allows users to create, update, and modify training plans and workouts. The app leverages AI to generate tailored workouts and training plans based on user-specific criteria. For users who authorize connection to their Strava account, the app incorporates their Strava data to create even more personalized training plans.

### Link
https://goober-app.vercel.app

## Features

- Create, update, and modify training plans and workouts
- AI-generated customized workouts and training plans
- Strava integration for enhanced personalization
- User authentication and authorization
- Responsive design with Tailwind CSS

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma (ORM)
- PostgreSQL
- Docker
- Clerk (Authentication)
- React Query
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Docker
- Git
- Make

### Environment Setup

1. Clone the repository:

   ```
   git clone https://github.com/juliansunn/goober-app.git
   cd goober-app
   ```

2. Run the setup command:

   ```
   make setup
   ```

   This will create a `.env` file from `.env.sample` if it doesn't exist. The command will then prompt you to update the `.env` file with your actual configuration.

3. Open the `.env` file and update the variables with your actual credentials:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/goober_db"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   OPENAI_API_KEY=your_openai_api_key
   STRAVA_CLIENT_ID=your_strava_client_id
   STRAVA_CLIENT_SECRET=your_strava_client_secret
   NEXTAUTH_SECRET=any_generated_string_of_your_choice
   NEXTAUTH_URL=http://localhost:3000

   ```

4. After updating the `.env` file, set `ENV_CONFIGURED=true` at the end of the file.

5. Run the setup command again to complete the setup process:

   ```
   make setup
   ```

### Database Setup

1. Start the PostgreSQL instance using Docker Compose:

   ```
   docker-compose up -d
   ```

2. Run Prisma migrations:
   ```
   npx prisma migrate dev
   ```

### Running the Application

1. Install dependencies:

   ```
   npm install
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Makefile Commands

We've included a Makefile to simplify common tasks. Here are the available commands:

- `make setup`: Sets up the entire environment (installs dependencies, starts Docker, runs migrations)
- `make start`: Starts the development server
- `make db-start`: Starts the PostgreSQL Docker container
- `make db-stop`: Stops the PostgreSQL Docker container
- `make migrate`: Runs Prisma migrations
- `make prisma-studio`: Starts Prisma Studio for database management

To use these commands, simply run `make <command>` in your terminal.

## AI-Powered Workout Generation

This application leverages the OpenAI API to generate structured workout plans tailored to each user's needs. Here's how it works:

### Structured Output

We use OpenAI's function calling feature to ensure that the AI generates workouts in a consistent, structured format. This approach allows us to:

1. Define a specific schema for workout plans
2. Ensure all generated workouts adhere to this schema
3. Easily parse and store the generated workouts in our database

### Workout Generation Process

1. **User Input**: The user provides their fitness goals, experience level, available equipment, and any other relevant information.

2. **API Request**: We send a request to the OpenAI API, including:

   - The user's input
   - A predefined function schema that outlines the structure of a workout plan
   - Any additional context, such as the user's Strava data (if authorized)

3. **AI Generation**: The AI model generates a workout plan that fits the provided schema.

4. **Parsing and Storage**: The application parses the structured output and if the user would like to save it, the workout is stored in the database.

5. **Presentation**: The generated workout is presented to the user in a user-friendly format.

### Example Schema

Here's a simplified example of the schema we use for workout generation, based on our Prisma database schema:

```typescript
interface Workout {
  title: string;
  description: string;
  type: "RUN" | "BIKE" | "SWIM";
  items: WorkoutItem[];
}

interface WorkoutItem {
  order: number;
  interval?: Interval;
  repeatGroup?: RepeatGroup;
}

interface Interval {
  type: "WARMUP" | "COOLDOWN" | "ACTIVE" | "REST";
  durationType: "TIME" | "DISTANCE" | "HEART_RATE" | "CALORIES";
  durationValue: number;
  durationUnit: string;
  intensityType:
    | "NONE"
    | "CADENCE"
    | "HEART_RATE"
    | "POWER"
    | "PACE_MILE"
    | "PACE_KM"
    | "PACE_400M";
  intensityMin?: string;
  intensityMax?: string;
}

interface RepeatGroup {
  repeats: number;
  intervals: Interval[];
}
```

This schema allows for complex workout structures, including:

- Different types of workouts (Run, Bike, Swim). This will expand as the workout schema matures to include more sports and workout paradigms.
- Various interval types (Warmup, Cooldown, Active, Rest)
- Flexible duration and intensity settings
- Repeat groups for interval sets

By using this structured approach, we ensure that the AI-generated workouts are consistent, easily manageable within our application, and can be readily adapted to users' needs.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Environment Variables

This project uses environment variables for configuration. We provide a `.env.sample` file in the repository as a template. Here's how to use it:

1. The `.env.sample` file is included in the repository and is not gitignored. It serves as a template for the required environment variables.

2. When setting up the project, copy `.env.sample` to a new file named `.env`:

   ```
   cp .env.sample .env
   ```

3. Edit the `.env` file and fill in your actual values for each environment variable.

4. The `.env` file should be gitignored (it is by default in this project). Never commit your actual `.env` file to the repository, as it may contain sensitive information.

5. If you add new environment variables to your project, make sure to:
   - Add them to the `.env.sample` file with a placeholder value
   - Update the README with any necessary instructions for obtaining or setting the new variable

### Important Note on Security

The `.env.sample` file should never contain real credentials or sensitive information. Use placeholder values or instructions in this file. Real credentials should only be placed in the `.env` file, which is not committed to the repository.
