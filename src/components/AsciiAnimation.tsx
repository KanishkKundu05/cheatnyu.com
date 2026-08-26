"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  layoutWithLines,
  measureNaturalWidth,
  prepareWithSegments,
} from "@chenglou/pretext";
import {
  createDynamicFrame,
  frames,
} from "@/data/frames";
import CheatNyuWordmark from "@/components/CheatNyuWordmark";

interface Segment {
  text: string;
  cls: string;
}

type AsciiStyle = CSSProperties & {
  "--ascii-font-size"?: string;
};

type LayoutMetrics = {
  lineWidths: number[];
  naturalWidth: number;
  fontSize: number;
};

const BASE_FONT_SIZE = 14;
const BASE_LINE_HEIGHT = 1.15;
const TARGET_FRAME_MS = 1000 / 30;
const PRETEXT_FONT =
  '14px "JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", Consolas, Monaco, monospace';
const RAGEBAITED_EMAILS = new Set([
  "nsl6265@stern.nyu.edu",
  "ntl2695@stern.nyu.edu",
  "ck3880@nyu.edu",
]);
const DEFAULT_CONFIRMATION_COPY = "yay, were gna go to mars tog :)";
const RAGEBAITED_CONFIRMATION_COPY = "sorry i ragebaited you";
const EARLY_JOURNEY_EMAIL = "zg2312@nyu.edu";
const EARLY_JOURNEY_CONFIRMATION_COPY = "TY for being so early in my journey";

function isAllowedWaitlistEmail(email: string) {
  return /^[^\s@]+@nyu\.edu$/.test(email) || RAGEBAITED_EMAILS.has(email);
}

function parseLineSegments(line: string): Segment[] {
  const segments: Segment[] = [];
  let currentCls = "violet";
  let currentText = "";

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    let cls: string;

    if (ch === "%") {
      cls = "violet";
    } else {
      cls = "center";
    }

    if (cls === currentCls) {
      currentText += ch;
    } else {
      if (currentText) segments.push({ text: currentText, cls: currentCls });
      currentCls = cls;
      currentText = ch;
    }
  }
  if (currentText) segments.push({ text: currentText, cls: currentCls });

  return segments;
}

export default function AsciiAnimation() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const [confirmationCopy, setConfirmationCopy] = useState(
    DEFAULT_CONFIRMATION_COPY
  );
  const [layoutMetrics, setLayoutMetrics] = useState<LayoutMetrics | null>(null);

  useEffect(() => {
    let rafId = 0;
    let previousFrameAt = 0;

    const tick = (now: number) => {
      if (now - previousFrameAt >= TARGET_FRAME_MS) {
        setAnimationPhase(now / 1000);
        previousFrameAt = now;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const prepared = prepareWithSegments(frames[0].join("\n"), PRETEXT_FONT, {
      whiteSpace: "pre-wrap",
      letterSpacing: 0,
    });
    const naturalWidth = measureNaturalWidth(prepared);
    const lineHeight = BASE_FONT_SIZE * BASE_LINE_HEIGHT;
    const fullLayout = layoutWithLines(prepared, naturalWidth + 1, lineHeight);

    const updateFit = () => {
      const availableWidth = Math.max(280, window.innerWidth - 48);
      const availableHeight = Math.max(180, window.innerHeight - 220);
      const fitScale = Math.min(
        availableWidth / naturalWidth,
        availableHeight / fullLayout.height,
        1.08
      );

      setLayoutMetrics({
        naturalWidth,
        lineWidths: fullLayout.lines.map((line) => line.width),
        fontSize: Math.max(4, Math.min(15, BASE_FONT_SIZE * fitScale)),
      });
    };

    updateFit();
    window.addEventListener("resize", updateFit);
    return () => window.removeEventListener("resize", updateFit);
  }, []);

  const frame = useMemo(
    () => createDynamicFrame(animationPhase),
    [animationPhase]
  );

  const parsedFrame = useMemo(
    () => frame.map((line) => parseLineSegments(line)),
    [frame]
  );

  const asciiStyle: AsciiStyle | undefined = layoutMetrics
    ? { "--ascii-font-size": `${layoutMetrics.fontSize}px` }
    : undefined;

  const handleWaitlistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!isAllowedWaitlistEmail(normalizedEmail)) {
      setEmailError("Use your @nyu.edu email.");
      return;
    }

    setIsSubmitting(true);
    setEmailError("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Could not join the waitlist.");
      }

      if (RAGEBAITED_EMAILS.has(normalizedEmail)) {
        setConfirmationCopy(RAGEBAITED_CONFIRMATION_COPY);
      } else if (normalizedEmail === EARLY_JOURNEY_EMAIL) {
        setConfirmationCopy(EARLY_JOURNEY_CONFIRMATION_COPY);
      } else {
        setConfirmationCopy(DEFAULT_CONFIRMATION_COPY);
      }
      setIsWaitlisted(true);
    } catch (error) {
      setEmailError(
        error instanceof Error
          ? error.message
          : "Could not join the waitlist. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isWaitlisted) {
    return (
      <main className="ascii-container waitlist-confirmation flex min-h-screen w-full flex-col items-center justify-center px-6">
        <div className="mars-launch-scene" aria-hidden="true">
          <div className="mars-planet">
            <span className="mars-crater mars-crater-one" />
            <span className="mars-crater mars-crater-two" />
            <span className="mars-crater mars-crater-three" />
          </div>
          <div className="rocket-flight">
            <div className="rocket">
              <span className="rocket-window" />
              <span className="rocket-fin rocket-fin-left" />
              <span className="rocket-fin rocket-fin-right" />
              <span className="rocket-flame" />
            </div>
          </div>
          <span className="launch-star launch-star-one" />
          <span className="launch-star launch-star-two" />
          <span className="launch-star launch-star-three" />
          <span className="launch-star launch-star-four" />
        </div>
        <p>{confirmationCopy}</p>
      </main>
    );
  }

  return (
    <main className="ascii-container flex min-h-screen w-full flex-col items-center justify-center px-6">
      <CheatNyuWordmark />
      <pre
        className="ascii-art"
        aria-label="Animated NYU torch logo"
        style={asciiStyle}
      >
        {parsedFrame.map((segments, lineIdx) => (
          <span className="ascii-row" key={lineIdx}>
            {segments.map((seg, segIdx) => (
              <span key={segIdx} className={seg.cls}>
                {seg.text}
              </span>
            ))}
          </span>
        ))}
      </pre>
      <form className="waitlist-form" noValidate onSubmit={handleWaitlistSubmit}>
        <label className="sr-only" htmlFor="waitlist-email">
          NYU email
        </label>
        <input
          aria-describedby={emailError ? "waitlist-email-error" : undefined}
          aria-invalid={emailError ? "true" : "false"}
          autoComplete="email"
          className="waitlist-email-input"
          disabled={isSubmitting}
          id="waitlist-email"
          inputMode="email"
          onChange={(event) => {
            setEmail(event.target.value);
            if (emailError) setEmailError("");
          }}
          placeholder="email@nyu.edu"
          type="email"
          value={email}
        />
        <p
          aria-live="polite"
          className="waitlist-email-error"
          id="waitlist-email-error"
        >
          {emailError}
        </p>
      </form>
    </main>
  );
}
