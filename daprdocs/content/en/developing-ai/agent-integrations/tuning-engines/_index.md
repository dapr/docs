---
type: docs
title: "Tuning Engines"
linkTitle: "Tuning Engines"
weight: 45
description: "Use Dapr Workflow with Tuning Engines as a governed AI endpoint"
---

### What is the Dapr Tuning Engines integration pattern?

Dapr Workflow owns durable execution, retries, service invocation, pub/sub, and
sidecar-based application integration. Tuning Engines can sit behind workflow
activities as an OpenAI-compatible AI endpoint that provides model routing,
policy checks, approvals, usage attribution, and runtime traces.

Use this pattern when a Dapr application needs governed model calls without
embedding provider-specific credentials or policy logic in every workflow.

### Configuration

Set a Tuning Engines inference key and choose the model or routing alias your
tenant has enabled:

```bash
export TE_INFERENCE_KEY=sk-te-your-inference-key
export TE_MODEL=auto
```

### Activity example

```ts
import { WorkflowRuntime } from "@dapr/dapr";

type Input = {
  prompt: string;
  run_id: string;
};

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

async function governedModelActivity(_ctx: unknown, input: Input) {
  const request_id = newId("req");
  const response = await fetch("https://api.tuningengines.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TE_INFERENCE_KEY}`,
      "Content-Type": "application/json",
      "X-TE-Run-ID": input.run_id,
      "X-TE-Request-ID": request_id,
    },
    body: JSON.stringify({
      model: process.env.TE_MODEL || "auto",
      messages: [{ role: "user", content: input.prompt }],
      metadata: {
        run_id: input.run_id,
        request_id,
        runtime: "dapr",
        event_type: "model.call",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Tuning Engines request failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

const runtime = new WorkflowRuntime();
runtime.registerActivityWithName("governedModelActivity", governedModelActivity);
```

The `run_id` and `request_id` metadata let Tuning Engines correlate the model
call with policy decisions, approval requests, usage/cost logs, and trace
events. Dapr continues to own the workflow state and the activity lifecycle.
