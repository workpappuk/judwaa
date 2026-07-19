import { NextResponse } from "next/server";

import { createSelfServeOnboarding } from "@/app/nocode/_lib/repository";
import { SelfServeOnboardingInputSchema } from "@/app/nocode/_lib/schema";

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const payload = SelfServeOnboardingInputSchema.parse(json);
    const onboarding = await createSelfServeOnboarding(payload);

    return NextResponse.json(
      {
        message: "Company onboarding request submitted successfully.",
        onboarding,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process onboarding request.";

    return NextResponse.json(
      {
        message,
      },
      { status: 400 },
    );
  }
}
