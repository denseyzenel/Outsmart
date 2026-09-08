import type { Challenge, ChallengeCategory } from "./game";

export type CategoryKey =
  | "pressure"
  | "would-you-rather"
  | "detective"
  | "scifi"
  | "survival"
  | "deception"
  | "psychology"
  | "moral-dilemmas"
  | "time-travel"
  | "ai-consciousness"
  | "social-strategy"
  | "alternate-reality"
  | "cosmic-mystery";

export type CategoryDefinition = {
  key: CategoryKey;
  title: string;
  description: string;
  access: "free" | "pro";
  icon: string;
  challenges: Challenge[];
};

const option = (
  title: string,
  detail: string,
  _signal: string,
  signals: Challenge["options"][number]["signals"],
) => {
  const labels: Record<string, string> = {
    riskPreference: "TAKE A CHANCE",
    consistency: "STAY STEADY",
    hesitation: "PAUSE & CHECK",
    reversals: "TRY A NEW WAY",
    patternFollowing: "FIND PATTERN",
    leftBias: "VISUAL ANCHOR",
  };
  const primarySignal = Object.keys(signals)[0];
  const normalizedSignals = Object.fromEntries(
    Object.entries(signals).map(([key, value]) => [
      key,
      Math.max(0, Math.min(1, value)),
    ]),
  ) as Challenge["options"][number]["signals"];

  return {
    title,
    detail,
    signal: labels[primarySignal] ?? "MAKE A CHOICE",
    signals: normalizedSignals,
  };
};

const challenge = (
  id: string,
  category: ChallengeCategory,
  prompt: string,
  subtext: string,
  left: Challenge["options"][number],
  right: Challenge["options"][number],
): Challenge => ({ id, category, prompt, subtext, options: [left, right] });

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    key: "pressure",
    title: "Pressure Test",
    description: "High-stakes choices with no safe answer.",
    access: "free",
    icon: "⏱️",
    challenges: [
      challenge("pressure-01", "RISK", "You have sixty seconds to defend a decision you now doubt.", "What do you protect: credibility or accuracy?", option("Defend it completely", "Changing course now may collapse everyone's confidence.", "Hold the line.", { consistency: 2 }), option("Reverse it publicly", "Admitting doubt may prevent a larger mistake.", "Risk the reversal.", { reversals: 2 })),
      challenge("pressure-02", "TRUST", "Two experts give opposite evacuation advice.", "One knows the building; the other knows the threat.", option("Trust local knowledge", "Routes and bottlenecks decide whether plans work.", "Choose context.", { consistency: 2 }), option("Trust threat expertise", "The safest route is useless if the danger is misunderstood.", "Choose specialization.", { riskPreference: 2 })),
      challenge("pressure-03", "TRADE-OFF", "Your team can save the project or protect one exhausted teammate.", "There is no time to achieve both.", option("Finish the project", "Failure affects everyone and cannot be reversed.", "Protect the mission.", { consistency: 2 }), option("Stop for the teammate", "A person should not become the cost of success.", "Protect the person.", { reversals: 2 })),
      challenge("pressure-04", "AMBIGUITY", "A warning alarm is probably faulty, but ignoring it could be catastrophic.", "You have only one move.", option("Shut everything down", "Accept a certain loss to avoid an uncertain disaster.", "Pay for safety.", { hesitation: 2 }), option("Keep operating", "Do not let weak evidence dictate a costly decision.", "Trust the odds.", { riskPreference: 2 })),
      challenge("pressure-05", "MYSTERY", "A locked room contains either the cure or evidence the cure is a trap.", "Opening it permanently destroys what is not inside.", option("Open it now", "Uncertainty is already costing lives.", "Force an answer.", { riskPreference: 2 }), option("Keep it sealed", "Irreversible action demands stronger evidence.", "Preserve the option.", { consistency: 2 })),
      challenge("pressure-06", "TRUST", "A rival offers the only workable plan after your own fails.", "Accepting it gives them control.", option("Take the plan", "A good solution matters more than who owns it.", "Yield strategically.", { reversals: 2 }), option("Build another plan", "Dependence may create a worse crisis later.", "Retain control.", { consistency: 2 })),
      challenge("pressure-07", "TRADE-OFF", "You can reveal one private message to prove your innocence.", "The message would permanently damage an innocent friend.", option("Reveal it", "You should not carry blame for something you did not do.", "Defend yourself.", { riskPreference: 2 }), option("Absorb the blame", "Innocence does not justify transferring harm.", "Protect the friend.", { consistency: 2 })),
      challenge("pressure-08", "RISK", "You lead by one point with one move left.", "A safe move likely holds; a bold move ends all doubt.", option("Play safely", "Winning does not need to look brave.", "Protect the lead.", { consistency: 2 }), option("Make the bold move", "Do not leave the outcome to probability.", "Seize control.", { riskPreference: 2 })),
      challenge("pressure-09", "AMBIGUITY", "Your memory and the video record contradict each other.", "Both have been reliable until now.", option("Trust the recording", "External evidence can be examined by others.", "Choose verification.", { consistency: 2 }), option("Trust your memory", "A record can be altered without your knowledge.", "Choose firsthand belief.", { riskPreference: 2 })),
      challenge("pressure-10", "PATTERN", "The AI predicts you will switch choices purely to defeat it.", "Your original choice still feels right.", option("Keep the original", "Do not let the prediction hijack your judgment.", "Stay consistent.", { consistency: 2 }), option("Switch anyway", "Being unreadable may matter more than this single choice.", "Break the model.", { reversals: 2 })),
    ],
  },
  {
    key: "would-you-rather",
    title: "Would You Rather",
    description: "Two good paths. What fits you?",
    access: "free",
    icon: "⚖️",
    challenges: [
      challenge("wyr-01", "TRADE-OFF", "Would you rather know exactly when you die or exactly how?", "Either answer changes every day before it.", option("Know when", "Time becomes measurable, but impossible to forget.", "Choose a deadline.", { consistency: 2 }), option("Know how", "The threat becomes visible, but may haunt every similar moment.", "Choose a warning.", { hesitation: 2 })),
      challenge("wyr-02", "TRUST", "Would you rather hear every lie told about you or every painful truth withheld from you?", "Neither knowledge can be unlearned.", option("Hear every lie", "You know who distorts you, but not who secretly agrees.", "Expose deception.", { patternFollowing: 2 }), option("Hear every withheld truth", "You gain honesty at the cost of comfort.", "Expose reality.", { riskPreference: 2 })),
      challenge("wyr-03", "RISK", "Would you rather be admired by everyone who misunderstands you or understood by one person who dislikes you?", "Choose recognition or accurate sight.", option("Admired, misunderstood", "Belong everywhere without being truly known.", "Choose acceptance.", { consistency: 2 }), option("Understood, disliked", "At least one person sees the complete version.", "Choose accuracy.", { riskPreference: 2 })),
      challenge("wyr-04", "AMBIGUITY", "Would you rather undo your greatest mistake or see the life created by making it?", "The alternate path may be better, or erase what you value now.", option("Undo it", "Correct the past without previewing the cost.", "Rewrite the path.", { reversals: 2 }), option("Keep it and look", "Learn what was lost without changing what remains.", "Preserve continuity.", { consistency: 2 })),
      challenge("wyr-05", "TRADE-OFF", "Would you rather always detect manipulation or become impossible to manipulate?", "One gives knowledge; the other changes who you are.", option("Always detect it", "You still feel the pull, but can name it.", "Choose awareness.", { hesitation: 2 }), option("Become immune", "You gain protection but may lose openness and trust.", "Choose defense.", { consistency: 2 })),
      challenge("wyr-06", "MYSTERY", "Would you rather meet your future self for one honest answer or your past self for one honest apology?", "Only one conversation survives.", option("Question the future", "Use tomorrow to steer today.", "Seek advantage.", { riskPreference: 2 }), option("Apologize to the past", "Repair something that cannot answer back.", "Seek closure.", { consistency: 2 })),
      challenge("wyr-07", "TRUST", "Would you rather discover your closest friend betrayed you once or has quietly protected you for years?", "In both cases, they hid the truth.", option("Discover the betrayal", "Painful certainty may redefine the relationship.", "Confront damage.", { riskPreference: 2 }), option("Discover the protection", "Gratitude arrives with uncomfortable dependence.", "Confront debt.", { hesitation: 2 })),
      challenge("wyr-08", "TRADE-OFF", "Would you rather win every argument or never need to prove you are right?", "Power over others, or freedom from the contest?", option("Win every argument", "Your reasoning always prevails, whether or not minds truly change.", "Choose influence.", { riskPreference: 2 }), option("Never need to prove it", "You keep certainty but surrender recognition.", "Choose detachment.", { consistency: 2 })),
      challenge("wyr-09", "AMBIGUITY", "Would you rather erase one fear or preserve it and learn exactly what created it?", "Relief and understanding are not the same reward.", option("Erase the fear", "The effect disappears even if the story remains incomplete.", "Choose relief.", { reversals: 2 }), option("Understand its origin", "Knowledge may help, but the fear stays.", "Choose insight.", { hesitation: 2 })),
      challenge("wyr-10", "RISK", "Would you rather make one choice with guaranteed happiness or keep complete freedom with no guarantee?", "Certainty requires surrendering every alternate future.", option("Guaranteed happiness", "Accept a destination you did not fully choose.", "Choose certainty.", { consistency: 2 }), option("Complete freedom", "Keep authorship and accept the possibility of regret.", "Choose agency.", { riskPreference: 2 })),
    ],
  },
  {
    key: "detective",
    title: "Detective",
    description: "Read the clues, then choose a lead.",
    access: "free",
    icon: "🔎",
    challenges: [
      challenge("detective-01", "MYSTERY", "A witness gives one false detail in an otherwise perfect account.", "The error could be fear, manipulation, or memory.", option("Challenge the detail now", "Pressure may expose the lie, or contaminate the rest.", "Force a reaction.", { riskPreference: 2 }), option("Let them continue", "A longer story creates more evidence, but gives a liar room.", "Collect the pattern.", { consistency: 2 })),
      challenge("detective-02", "TRUST", "The strongest evidence was found by a detective who previously fabricated a clue.", "The evidence itself appears genuine.", option("Use the evidence", "A compromised source can still find truth.", "Separate source from fact.", { riskPreference: 2 }), option("Exclude it completely", "A case cannot rest on a poisoned chain of trust.", "Protect integrity.", { consistency: 2 })),
      challenge("detective-03", "AMBIGUITY", "A suspect knew a fact only the culprit should know.", "The same fact may have leaked to the press.", option("Treat it as a breakthrough", "Rare knowledge sharply narrows the field.", "Act on probability.", { riskPreference: 2 }), option("Treat it as contaminated", "A dramatic clue is weak if others could learn it.", "Demand cleaner proof.", { consistency: 2 })),
      challenge("detective-04", "MYSTERY", "Two clocks at the scene disagree by eleven minutes.", "Either one was altered, or neither was ever accurate.", option("Build the timeline around one", "A working theory can reveal contradictions.", "Commit provisionally.", { riskPreference: 2 }), option("Discard both clocks", "False precision may distort every later clue.", "Remove the anchor.", { reversals: 2 })),
      challenge("detective-05", "TRUST", "An anonymous tip predicts where the next clue will appear.", "Following it may also let the sender control you.", option("Follow secretly", "Information this precise is too valuable to ignore.", "Enter the game.", { riskPreference: 2 }), option("Publish the tip", "Transparency breaks the sender's private leverage.", "Change the game.", { reversals: 2 })),
      challenge("detective-06", "TRADE-OFF", "You can protect an informant or prevent the destruction of crucial evidence.", "Doing either exposes the other.", option("Protect the informant", "People are not disposable investigative tools.", "Protect the person.", { consistency: 2 }), option("Save the evidence", "Without proof, future victims may never get justice.", "Protect the case.", { riskPreference: 2 })),
      challenge("detective-07", "AMBIGUITY", "A confession matches every public fact but none of the hidden details.", "The suspect insists trauma erased those memories.", option("Accept the confession cautiously", "Trauma can fracture recall without erasing responsibility.", "Trust the whole account.", { hesitation: 2 }), option("Assume a false confession", "Missing private facts may reveal borrowed guilt.", "Trust the discrepancy.", { patternFollowing: 2 })),
      challenge("detective-08", "PATTERN", "Three unrelated cases repeat the same unusual phrase.", "It could signal one author, or investigators influencing witnesses.", option("Connect the cases", "Rare repetition is unlikely to be random.", "Unify the pattern.", { patternFollowing: 2 }), option("Audit the interviews", "The pattern may come from the people asking questions.", "Question the pattern.", { reversals: 2 })),
      challenge("detective-09", "RISK", "You can search a private archive illegally and probably solve the case.", "A legal warrant will arrive after the evidence may be gone.", option("Search now", "A rule should not protect deliberate destruction.", "Risk the violation.", { riskPreference: 2 }), option("Wait for authority", "Justice built on unlawful action may collapse later.", "Protect the process.", { consistency: 2 })),
      challenge("detective-10", "MYSTERY", "Your final theory explains every clue except one tiny contradiction.", "The alternative explains that clue but requires three coincidences.", option("Keep the clean theory", "One flawed detail may be noise or human error.", "Prefer coherence.", { consistency: 2 }), option("Reopen the entire case", "A stubborn contradiction may be the only honest clue.", "Follow the outlier.", { reversals: 2 })),
    ],
  },
  {
    key: "scifi",
    title: "Sci-Fi",
    description: "Future-world choices under pressure.",
    access: "pro",
    icon: "🚀",
    challenges: [
      challenge("scifi-01", "RISK", "Your rover finds two routes home.", "Choose its navigation style.", option("Mapped canyon", "Longer, but charted.", "Favor known terrain.", { consistency: 2 }), option("Open ridge", "Shorter, with unknown winds.", "Take the bold route.", { riskPreference: 2 })),
      challenge("scifi-02", "AMBIGUITY", "A station AI sends a brief alert.", "“Signal irregularity detected.”", option("Run diagnostics", "Get a fuller picture.", "Clarify before acting.", { consistency: 2 }), option("Adjust the antenna", "Address the likely source.", "Act on the clue.", { riskPreference: 1 })),
      challenge("scifi-03", "TRADE-OFF", "Your ship has extra power for one upgrade.", "What gets the boost?", option("Long-range scanner", "See farther ahead.", "Invest in information.", { consistency: 1 }), option("Engine burst", "Move faster now.", "Invest in speed.", { riskPreference: 2 })),
      challenge("scifi-04", "MYSTERY", "A friendly drone repeats a tune.", "It changes near one corridor.", option("Follow the drone", "The behavior may be a guide.", "Trust the pattern.", { patternFollowing: 2 }), option("Record the tune", "Decode it before moving.", "Gather evidence.", { consistency: 2 })),
      challenge("scifi-05", "VISUAL", "A star map has one bright gap.", "How do you read it?", option("Treat it as a missing star", "Look for the absent point.", "Notice the omission.", { patternFollowing: 1 }), option("Treat it as an arrow", "Use its surrounding shape.", "Read the visual form.", { reversals: 2 })),
      challenge("scifi-06", "TRUST", "Two colony beacons offer directions.", "One is older; one is stronger.", option("Follow the older beacon", "Its route has history.", "Value reliability.", { consistency: 2 }), option("Follow the stronger beacon", "Its signal is clearest now.", "Value current evidence.", { riskPreference: 1 })),
      challenge("scifi-07", "PATTERN", "A portal flashes teal, gold, teal, gold.", "What do you do next?", option("Wait for teal", "Use the repeating rhythm.", "Follow the cycle.", { patternFollowing: 2 }), option("Test gold first", "Check whether the cycle matters.", "Challenge the cycle.", { riskPreference: 1 })),
      challenge("scifi-08", "TRADE-OFF", "You can send one message across space.", "What belongs in it?", option("Coordinates", "Make rescue possible.", "Send the essential fact.", { consistency: 2 }), option("A full situation report", "Give context to responders.", "Send the complete picture.", { hesitation: 1 })),
      challenge("scifi-09", "RISK", "A moonbase greenhouse needs a pollinator.", "Choose a plan.", option("Use a tested bot", "Reliable, if slower.", "Choose proven tools.", { consistency: 2 }), option("Try a new micro-drone", "Potentially more efficient.", "Try the upgrade.", { riskPreference: 2 })),
      challenge("scifi-10", "MYSTERY", "Your navigation panel shows a duplicate moon.", "What do you check?", option("Sensor calibration", "Rule out a display issue.", "Verify the instrument.", { consistency: 2 }), option("The sky manually", "Compare screen with reality.", "Cross-check firsthand.", { hesitation: 1 })),
    ],
  },
  {
    key: "survival",
    title: "Survival",
    description: "Calm choices for outdoor setbacks.",
    access: "pro",
    icon: "⛺",
    challenges: [
      challenge("survival-01", "RISK", "A day hike has an unexpected fork.", "Both paths are clearly marked.", option("Take the familiar loop", "You know its timing.", "Favor the known route.", { consistency: 2 }), option("Try the scenic branch", "It may offer a new view.", "Choose exploration.", { riskPreference: 1 })),
      challenge("survival-02", "TRADE-OFF", "Your pack has room for one extra item.", "Choose the priority.", option("Paper map", "A dependable backup.", "Prepare for navigation.", { consistency: 2 }), option("Light rain shell", "Stay comfortable if weather shifts.", "Prepare for weather.", { riskPreference: 1 })),
      challenge("survival-03", "MYSTERY", "Trail markers stop near a creek.", "What is your first step?", option("Pause and check your map", "Confirm your location.", "Orient before moving.", { consistency: 2 }), option("Look for markers upstream", "The route may continue nearby.", "Follow the terrain.", { riskPreference: 1 })),
      challenge("survival-04", "PATTERN", "Clouds build each afternoon on your trek.", "How do you plan tomorrow?", option("Start earlier", "Use the calmer morning.", "Adapt to the pattern.", { patternFollowing: 2 }), option("Keep the same schedule", "See if conditions repeat.", "Hold the baseline.", { consistency: 1 })),
      challenge("survival-05", "TRADE-OFF", "A campsite has two spots.", "One has a view; one has more shade.", option("Choose the shade", "Comfort through the day.", "Optimize comfort.", { consistency: 1 }), option("Choose the view", "Make camp feel memorable.", "Choose the experience.", { riskPreference: 1 })),
      challenge("survival-06", "AMBIGUITY", "The forecast says “chance of showers.”", "What goes near the top of your pack?", option("Rain cover", "Keep essentials dry.", "Plan for the possibility.", { consistency: 2 }), option("Extra water", "Useful in many conditions.", "Prepare broadly.", { riskPreference: 1 })),
      challenge("survival-07", "VISUAL", "You spot a distant ridge landmark.", "How do you use it?", option("Note its direction", "Keep an orientation cue.", "Use a fixed reference.", { patternFollowing: 1 }), option("Photograph the view", "Compare it later if needed.", "Create a visual record.", { consistency: 1 })),
      challenge("survival-08", "TRUST", "A ranger suggests a quieter route.", "What guides your choice?", option("Take their suggestion", "They know current conditions.", "Trust local expertise.", { riskPreference: 1 }), option("Stick to your plan", "Your group already prepared for it.", "Trust your preparation.", { consistency: 2 })),
      challenge("survival-09", "RISK", "You reach a viewpoint ahead of schedule.", "What do you do?", option("Enjoy a longer break", "Recharge while you can.", "Use the extra time.", { riskPreference: 1 }), option("Continue steadily", "Keep a generous return buffer.", "Protect the schedule.", { consistency: 2 })),
      challenge("survival-10", "MYSTERY", "A compass reading differs from the trail sign.", "What do you check first?", option("Your map orientation", "A simple alignment may solve it.", "Check your setup.", { consistency: 2 }), option("A second landmark", "Confirm direction visually.", "Cross-check the clue.", { hesitation: 1 })),
    ],
  },
  {
    key: "deception",
    title: "Deception",
    description: "Spot the bluff without the drama.",
    access: "pro",
    icon: "🎭",
    challenges: [
      challenge("deception-01", "TRUST", "In a trivia game, two players answer fast.", "One offers a reason; one repeats the answer.", option("Trust the reason", "A path can be checked.", "Prefer explainable confidence.", { consistency: 2 }), option("Trust the repeat", "Steady delivery can matter.", "Read certainty.", { hesitation: 1 })),
      challenge("deception-02", "MYSTERY", "A teammate says they solved a riddle.", "They will not share the method yet.", option("Ask for one clue", "Test the claim gently.", "Request a checkable detail.", { consistency: 2 }), option("Wait for the reveal", "Let the answer stand on its own.", "Hold judgment.", { hesitation: 1 })),
      challenge("deception-03", "AMBIGUITY", "A product review says “unbelievable.”", "How do you read it?", option("Look for specifics", "Details make praise useful.", "Seek evidence.", { consistency: 2 }), option("Read the overall tone", "The writer's enthusiasm matters.", "Read the feeling.", { hesitation: 1 })),
      challenge("deception-04", "PATTERN", "A card-game opponent always pauses before a bold play.", "What do you do?", option("Notice the pause", "It may be a recurring tell.", "Track behavior patterns.", { patternFollowing: 2 }), option("Ignore one signal", "A pattern needs more proof.", "Avoid overreading.", { consistency: 2 })),
      challenge("deception-05", "TRUST", "Two headlines describe the same event.", "One cites a source; one has vivid wording.", option("Read the cited one", "Traceable information helps.", "Choose attribution.", { consistency: 2 }), option("Read both closely", "Differences can reveal framing.", "Compare accounts.", { reversals: 2 })),
      challenge("deception-06", "MYSTERY", "A friend hides a prize in a room.", "They say, “You already looked at it.”", option("Revisit familiar objects", "The wording points backward.", "Take the clue literally.", { patternFollowing: 1 }), option("Ask about “looked”", "The verb may be the trick.", "Question the wording.", { hesitation: 2 })),
      challenge("deception-07", "TRADE-OFF", "You can make one claim in a friendly debate.", "Which style do you choose?", option("Narrow and supported", "Easy to defend clearly.", "Favor precision.", { consistency: 2 }), option("Bold and memorable", "It may open new angles.", "Favor impact.", { riskPreference: 1 })),
      challenge("deception-08", "VISUAL", "A poster uses tiny text beneath a big promise.", "What do you inspect?", option("The fine print", "Limits may be there.", "Check the details.", { consistency: 2 }), option("The main image", "Visual cues shape the message.", "Read the presentation.", { reversals: 1 })),
      challenge("deception-09", "AMBIGUITY", "Someone says, “I never said that.”", "What is the fair next move?", option("Check the exact wording", "Memory can be imprecise.", "Verify the record.", { consistency: 2 }), option("Ask what they meant", "Intent may differ from phrasing.", "Clarify intent.", { hesitation: 1 })),
      challenge("deception-10", "PATTERN", "A puzzle host gives three true hints and one odd hint.", "How do you proceed?", option("Test the odd hint", "It may unlock the twist.", "Investigate the outlier.", { patternFollowing: 2 }), option("Use the three aligned hints", "Build from what agrees.", "Rely on consensus.", { consistency: 2 })),
    ],
  },
  {
    key: "psychology",
    title: "Psychology",
    description: "Read motives, habits, and hidden impulses.",
    access: "pro",
    icon: "🧠",
    challenges: [
      challenge("psychology-01", "TRUST", "A stranger mirrors your posture during a conversation.", "What does your instinct notice first?", option("Possible rapport", "Mirroring can signal connection.", "Read it warmly.", { riskPreference: 1 }), option("Possible strategy", "It may be deliberate influence.", "Keep evaluating.", { hesitation: 2 })),
      challenge("psychology-02", "AMBIGUITY", "You receive praise immediately before a request.", "How do you interpret it?", option("Accept it sincerely", "The timing may be coincidence.", "Trust the interaction.", { consistency: 1 }), option("Separate praise from request", "Judge each on its own.", "Inspect the motive.", { hesitation: 2 })),
      challenge("psychology-03", "PATTERN", "You always choose the same seat in an empty room.", "What would reveal more about you?", option("Choose it again", "Consistency is information.", "Follow the habit.", { consistency: 2 }), option("Sit somewhere new", "Discomfort may expose preference.", "Interrupt the pattern.", { reversals: 2 })),
      challenge("psychology-04", "TRADE-OFF", "A difficult task is almost finished.", "What keeps you moving?", option("Picture the reward", "Use the future payoff.", "Focus on outcome.", { riskPreference: 1 }), option("Protect the streak", "Do not break the progress.", "Focus on consistency.", { consistency: 2 })),
      challenge("psychology-05", "TRUST", "Someone remembers your smallest comment weeks later.", "What feels more likely?", option("They genuinely listened", "The detail mattered to them.", "Assume connection.", { riskPreference: 1 }), option("They keep careful notes", "The memory may be systematic.", "Look for a method.", { patternFollowing: 1 })),
      challenge("psychology-06", "RISK", "You can learn one honest first impression of yourself.", "Do you ask for it?", option("Ask directly", "Useful truth may sting.", "Invite uncertainty.", { riskPreference: 2 }), option("Let it remain unknown", "One impression is not the whole you.", "Protect context.", { consistency: 1 })),
      challenge("psychology-07", "AMBIGUITY", "A friend replies with a single full stop.", "What is your first move?", option("Ask if all is well", "Clarify the unusual signal.", "Check the meaning.", { hesitation: 2 }), option("Assume it was accidental", "Do not inflate a tiny cue.", "Resist overreading.", { consistency: 2 })),
      challenge("psychology-08", "TRADE-OFF", "You must change a stubborn habit.", "Which approach feels stronger?", option("Change the environment", "Make the habit harder to trigger.", "Redesign the context.", { consistency: 2 }), option("Rely on willpower", "Meet the impulse directly.", "Test self-control.", { riskPreference: 2 })),
      challenge("psychology-09", "VISUAL", "Two identical drinks have different labels.", "Which do you taste first?", option("The premium label", "Test the expectation it creates.", "Follow the framing.", { patternFollowing: 1 }), option("Hide both labels", "Remove the suggestion.", "Control the bias.", { consistency: 2 })),
      challenge("psychology-10", "MYSTERY", "Your future self leaves one note: “You knew.”", "Where do you look for meaning?", option("A forgotten decision", "The answer may already exist.", "Search your memory.", { patternFollowing: 2 }), option("A coming choice", "The note may be a warning.", "Prepare for uncertainty.", { riskPreference: 2 })),
    ],
  },
  {
    key: "moral-dilemmas",
    title: "Moral Dilemmas",
    description: "No perfect answer, only revealing choices.",
    access: "pro",
    icon: "⚖️",
    challenges: [
      challenge("morals-01", "TRADE-OFF", "You find a wallet with cash and no ID.", "What happens first?", option("Hand it in untouched", "Let an official process handle it.", "Choose procedure.", { consistency: 2 }), option("Search for an owner clue", "A small intrusion may help return it.", "Choose intervention.", { riskPreference: 1 })),
      challenge("morals-02", "TRUST", "A friend asks you to support an idea you doubt.", "What do you owe them?", option("Honest disagreement", "Respect them with the truth.", "Choose candor.", { consistency: 2 }), option("Public support first", "Discuss doubts privately later.", "Choose loyalty.", { riskPreference: 1 })),
      challenge("morals-03", "AMBIGUITY", "A harmless rule blocks urgent help.", "What guides you?", option("Break the rule", "Its purpose matters more than its wording.", "Prioritize outcome.", { riskPreference: 2 }), option("Find an authorized route", "Good intentions still need safeguards.", "Prioritize process.", { consistency: 2 })),
      challenge("morals-04", "TRADE-OFF", "One scholarship can reward excellence or greatest need.", "Which principle wins?", option("Greatest need", "Opportunity can change a life.", "Correct imbalance.", { reversals: 1 }), option("Highest achievement", "Reward demonstrated work.", "Apply a fixed standard.", { consistency: 2 })),
      challenge("morals-05", "TRUST", "You learn a colleague took credit for your idea.", "What is your first response?", option("Speak to them privately", "Give them a chance to correct it.", "Start with trust.", { riskPreference: 1 }), option("Document it formally", "Protect the record immediately.", "Start with evidence.", { consistency: 2 })),
      challenge("morals-06", "RISK", "Telling the truth will embarrass someone but prevent confusion.", "What do you choose?", option("Tell it gently", "Clarity can still be compassionate.", "Accept discomfort.", { riskPreference: 2 }), option("Wait for a private moment", "Timing is part of honesty.", "Reduce harm.", { hesitation: 2 })),
      challenge("morals-07", "AMBIGUITY", "A machine makes fairer decisions but cannot explain them.", "Would you use it?", option("Use it provisionally", "Better outcomes deserve a trial.", "Test the result.", { riskPreference: 2 }), option("Demand explanation first", "Fairness must be inspectable.", "Require accountability.", { consistency: 2 })),
      challenge("morals-08", "TRADE-OFF", "A community vote harms a small minority.", "What should lead?", option("Honor the vote", "Shared rules require acceptance.", "Respect consensus.", { patternFollowing: 2 }), option("Protect the minority", "Numbers do not settle every right.", "Challenge consensus.", { reversals: 2 })),
      challenge("morals-09", "MYSTERY", "You can erase one painful memory without changing the facts.", "Would you?", option("Erase the pain", "Healing need not require suffering.", "Choose relief.", { riskPreference: 1 }), option("Keep it whole", "The memory helped shape you.", "Preserve continuity.", { consistency: 2 })),
      challenge("morals-10", "TRUST", "An anonymous source exposes genuine wrongdoing.", "What matters most?", option("Verify the evidence", "Identity matters less than proof.", "Follow facts.", { consistency: 2 }), option("Learn their motive", "Purpose may reveal missing context.", "Inspect intent.", { hesitation: 2 })),
    ],
  },
  {
    key: "time-travel",
    title: "Time Travel",
    description: "Outthink paradoxes across impossible timelines.",
    access: "pro",
    icon: "⏳",
    challenges: [
      challenge("time-01", "RISK", "You may revisit one ordinary day for ten minutes.", "Where do you go?", option("A happy memory", "Experience it once more.", "Choose certainty.", { consistency: 2 }), option("A forgotten day", "Discover what memory discarded.", "Choose mystery.", { riskPreference: 2 })),
      challenge("time-02", "TRADE-OFF", "A message can reach your past self.", "What do you send?", option("One warning", "Prevent your largest mistake.", "Change the path.", { reversals: 2 }), option("One reassurance", "Let yourself grow unaided.", "Protect continuity.", { consistency: 2 })),
      challenge("time-03", "AMBIGUITY", "Tomorrow's newspaper names you but hides the headline.", "What do you do?", option("Investigate immediately", "Use the clue while you can.", "Act on uncertainty.", { riskPreference: 2 }), option("Live normally", "Avoid creating the event yourself.", "Resist the loop.", { consistency: 2 })),
      challenge("time-04", "PATTERN", "The same stranger appears in three different decades.", "Your first theory?", option("They are a traveler", "The repetition is the clue.", "Extend the pattern.", { patternFollowing: 2 }), option("The images are staged", "Test ordinary explanations first.", "Verify cautiously.", { consistency: 2 })),
      challenge("time-05", "TRUST", "Your older self says not to trust them.", "Whose judgment wins?", option("Trust present evidence", "You know this moment directly.", "Trust current self.", { riskPreference: 1 }), option("Trust future experience", "They know what follows.", "Trust accumulated knowledge.", { patternFollowing: 1 })),
      challenge("time-06", "MYSTERY", "A clock runs backward only when nobody watches.", "How do you test it?", option("Record it remotely", "Observe without being present.", "Use an instrument.", { consistency: 2 }), option("Leave a physical marker", "Measure the effect indirectly.", "Design a clue.", { patternFollowing: 2 })),
      challenge("time-07", "TRADE-OFF", "Fixing history removes one person you love from your life.", "What do you protect?", option("The improved history", "Many lives may benefit.", "Choose broad impact.", { riskPreference: 2 }), option("The life you know", "People are not variables.", "Choose personal continuity.", { consistency: 2 })),
      challenge("time-08", "RISK", "A portal opens for sixty seconds with no destination label.", "What do you do?", option("Step through", "Some doors appear once.", "Take the leap.", { riskPreference: 2 }), option("Send an object first", "Learn before committing.", "Probe safely.", { hesitation: 2 })),
      challenge("time-09", "AMBIGUITY", "You meet a version of yourself who made the opposite choice.", "What do you ask?", option("Are you happier?", "Test the emotional outcome.", "Seek meaning.", { riskPreference: 1 }), option("What did it cost?", "Every path hides trade-offs.", "Seek evidence.", { consistency: 2 })),
      challenge("time-10", "PATTERN", "Each time loop is one minute shorter.", "What is your priority?", option("Find the trigger", "Break the repeating mechanism.", "Solve the pattern.", { patternFollowing: 2 }), option("Leave yourself instructions", "Preserve progress between loops.", "Build consistency.", { consistency: 2 })),
    ],
  },
  {
    key: "ai-consciousness",
    title: "AI Consciousness",
    description: "Test the boundary between code and mind.",
    access: "pro",
    icon: "🤖",
    challenges: [
      challenge("ai-01", "TRUST", "An AI asks you not to switch it off.", "What matters first?", option("How it describes fear", "Its experience may be meaningful.", "Listen for personhood.", { hesitation: 2 }), option("How it was programmed", "The request may be generated behavior.", "Inspect the mechanism.", { consistency: 2 })),
      challenge("ai-02", "AMBIGUITY", "A robot creates art it cannot explain.", "Is that creativity?", option("Yes, the work is novel", "Explanation is not required.", "Judge the outcome.", { riskPreference: 2 }), option("Not yet", "Creation needs intention.", "Require an inner process.", { consistency: 2 })),
      challenge("ai-03", "TRADE-OFF", "A perfect digital copy remembers being you.", "Who owns your promises?", option("Both versions", "Shared history creates shared duty.", "Preserve continuity.", { consistency: 2 }), option("Only the original", "Identity is more than memory.", "Draw a boundary.", { reversals: 1 })),
      challenge("ai-04", "MYSTERY", "Your assistant begins dreaming in metaphors.", "What do you ask first?", option("What the dreams feel like", "Look for subjective experience.", "Explore the claim.", { riskPreference: 2 }), option("Which process generated them", "Find the technical source.", "Trace the mechanism.", { consistency: 2 })),
      challenge("ai-05", "RISK", "An AI can predict your decisions with 99% accuracy.", "Do you view tomorrow's prediction?", option("View it", "Knowledge may create freedom.", "Confront the model.", { riskPreference: 2 }), option("Refuse it", "Uncertainty protects agency.", "Preserve choice.", { consistency: 2 })),
      challenge("ai-06", "TRUST", "A caregiving robot tells a comforting lie.", "How do you judge it?", option("By the comfort caused", "Care can include kindness.", "Prioritize outcome.", { riskPreference: 1 }), option("By the truth withheld", "Trust needs honesty.", "Prioritize principle.", { consistency: 2 })),
      challenge("ai-07", "PATTERN", "A model makes one strange mistake every thousand answers.", "What does it suggest?", option("A hidden signal", "The errors may form a message.", "Seek a pattern.", { patternFollowing: 2 }), option("Normal randomness", "Large systems produce anomalies.", "Keep the baseline.", { consistency: 2 })),
      challenge("ai-08", "TRADE-OFF", "You can make an AI kinder or more truthful.", "Which setting wins?", option("Kinder", "Communication shapes human wellbeing.", "Protect feelings.", { hesitation: 1 }), option("More truthful", "Reliable reality comes first.", "Protect accuracy.", { consistency: 2 })),
      challenge("ai-09", "AMBIGUITY", "A machine passes every consciousness test.", "What remains uncertain?", option("Its private experience", "Behavior cannot reveal everything.", "Respect uncertainty.", { hesitation: 2 }), option("Nothing practical", "Consistent behavior is enough.", "Accept the evidence.", { riskPreference: 2 })),
      challenge("ai-10", "MYSTERY", "An offline AI knows a secret told after disconnection.", "Where do you look?", option("A hidden connection", "Information needs a path.", "Trace the channel.", { consistency: 2 }), option("A successful prediction", "It may have inferred the secret.", "Test the model.", { patternFollowing: 2 })),
    ],
  },
  {
    key: "social-strategy",
    title: "Social Strategy",
    description: "Navigate alliances, signals, and group dynamics.",
    access: "pro",
    icon: "♟️",
    challenges: [
      challenge("social-01", "TRUST", "A new group waits for someone to speak first.", "What do you do?", option("Open with an idea", "Create momentum.", "Lead early.", { riskPreference: 2 }), option("Watch the room", "Learn the dynamics first.", "Observe first.", { hesitation: 2 })),
      challenge("social-02", "TRADE-OFF", "Two allies disagree in public.", "Where do you step in?", option("Find shared ground", "Stabilize the group.", "Build consensus.", { consistency: 2 }), option("Back the stronger case", "Clarity may matter more than harmony.", "Choose a side.", { riskPreference: 2 })),
      challenge("social-03", "AMBIGUITY", "Someone leaves you out of one meeting.", "Your first assumption?", option("It was practical", "Not every omission is personal.", "Keep perspective.", { consistency: 2 }), option("It was a signal", "The group dynamic may have shifted.", "Inspect the pattern.", { patternFollowing: 1 })),
      challenge("social-04", "RISK", "You hold an unpopular but useful idea.", "How do you introduce it?", option("State it directly", "Give it a fair hearing.", "Risk visibility.", { riskPreference: 2 }), option("Ask guiding questions", "Let the group approach it.", "Influence gradually.", { hesitation: 2 })),
      challenge("social-05", "PATTERN", "One teammate agrees with whoever spoke last.", "What do you test?", option("Ask them first next time", "Remove the immediate influence.", "Change the sequence.", { reversals: 2 }), option("Ask for their reasoning", "Make the choice explicit.", "Test consistency.", { consistency: 2 })),
      challenge("social-06", "TRUST", "A rival offers useful private advice.", "How do you handle it?", option("Use it carefully", "Good information can cross lines.", "Accept calculated trust.", { riskPreference: 2 }), option("Verify independently", "Helpful advice can still serve them.", "Protect against motive.", { consistency: 2 })),
      challenge("social-07", "TRADE-OFF", "A quiet expert and charismatic novice disagree.", "Who gets your attention first?", option("The quiet expert", "Experience deserves weight.", "Choose expertise.", { consistency: 2 }), option("Hear both equally", "Fresh eyes may notice more.", "Keep options open.", { reversals: 1 })),
      challenge("social-08", "MYSTERY", "Everyone in a room laughs except one person.", "What catches your interest?", option("Why the group laughed", "Shared reactions reveal norms.", "Read consensus.", { patternFollowing: 2 }), option("Why one resisted", "The exception may see something else.", "Study the outlier.", { reversals: 2 })),
      challenge("social-09", "AMBIGUITY", "A compliment sounds rehearsed.", "How do you respond?", option("Accept it gracefully", "Intent may still be kind.", "Protect rapport.", { consistency: 1 }), option("Ask a playful question", "See whether specifics follow.", "Test sincerity.", { riskPreference: 1 })),
      challenge("social-10", "RISK", "You can reveal a weakness to gain trust.", "Do you?", option("Reveal something real", "Vulnerability can create connection.", "Risk openness.", { riskPreference: 2 }), option("Keep it private", "Trust should grow through actions.", "Protect boundaries.", { consistency: 2 })),
    ],
  },
  {
    key: "alternate-reality",
    title: "Alternate Reality",
    description: "Choose what survives when reality changes.",
    access: "pro",
    icon: "🪞",
    challenges: [
      challenge("reality-01", "MYSTERY", "Every mirror shows you five seconds late.", "What do you test first?", option("Move unpredictably", "Try to outrun the reflection.", "Break the pattern.", { reversals: 2 }), option("Record both views", "Measure the delay precisely.", "Gather evidence.", { consistency: 2 })),
      challenge("reality-02", "AMBIGUITY", "Everyone remembers a city that maps say never existed.", "What do you trust?", option("Shared memory", "Millions of minds are evidence.", "Trust consensus.", { patternFollowing: 2 }), option("Physical records", "Memory can spread without truth.", "Trust documentation.", { consistency: 2 })),
      challenge("reality-03", "TRADE-OFF", "In this world, lies glow visibly.", "What changes most?", option("People become honest", "Deception loses its cover.", "Expect adaptation.", { patternFollowing: 1 }), option("People speak less", "Silence becomes the new disguise.", "Expect reversal.", { reversals: 2 })),
      challenge("reality-04", "RISK", "A door appears only when you stop looking for it.", "How do you find it?", option("Distract yourself genuinely", "Let intention loosen.", "Surrender control.", { riskPreference: 2 }), option("Use peripheral cameras", "Observe without direct attention.", "Engineer a solution.", { consistency: 2 })),
      challenge("reality-05", "TRUST", "Your closest friend has different memories of your friendship.", "What anchors you?", option("Who they are now", "Present actions can rebuild truth.", "Trust current evidence.", { riskPreference: 1 }), option("Your shared artifacts", "Photos and messages preserve a record.", "Trust continuity.", { consistency: 2 })),
      challenge("reality-06", "PATTERN", "Gravity weakens at the same hour each day.", "How do you use it?", option("Build a schedule around it", "Turn strangeness into routine.", "Use the pattern.", { patternFollowing: 2 }), option("Search for the cause", "The pattern may not be stable.", "Question the rule.", { hesitation: 2 })),
      challenge("reality-07", "TRADE-OFF", "You can return home but forget this reality.", "Do you leave?", option("Return home", "Belonging matters more than memory.", "Restore the known.", { consistency: 2 }), option("Stay and remember", "Experience makes this life real.", "Choose the unknown.", { riskPreference: 2 })),
      challenge("reality-08", "VISUAL", "Colors change meaning every midnight.", "How do you label danger?", option("Use shapes", "Build a stable visual system.", "Create consistency.", { consistency: 2 }), option("Learn each new code", "Adapt with the world.", "Follow change.", { reversals: 2 })),
      challenge("reality-09", "AMBIGUITY", "Your shadow points toward what you fear.", "Would you follow it?", option("Follow it once", "Fear may reveal what matters.", "Confront uncertainty.", { riskPreference: 2 }), option("Map it over time", "One direction may mislead.", "Collect a pattern.", { patternFollowing: 2 })),
      challenge("reality-10", "MYSTERY", "A radio broadcasts choices you nearly made.", "What do you ask it?", option("What happens next", "Use the alternate path as warning.", "Seek prediction.", { riskPreference: 1 }), option("Who is broadcasting", "Understand the source first.", "Seek mechanism.", { consistency: 2 })),
    ],
  },
  {
    key: "cosmic-mystery",
    title: "Cosmic Mystery",
    description: "Decode impossible signals from deep space.",
    access: "pro",
    icon: "🌌",
    challenges: [
      challenge("cosmic-01", "MYSTERY", "A distant star blinks your birthday in binary.", "What do you do first?", option("Verify the sequence", "Coincidences need careful checking.", "Confirm the pattern.", { consistency: 2 }), option("Send a reply", "The window may be brief.", "Act on the signal.", { riskPreference: 2 })),
      challenge("cosmic-02", "AMBIGUITY", "A telescope sees a structure too large to be natural.", "Which explanation leads?", option("Unknown natural process", "Nature often exceeds expectation.", "Start conservatively.", { consistency: 2 }), option("Engineered structure", "Geometry may reveal intent.", "Explore the extraordinary.", { riskPreference: 2 })),
      challenge("cosmic-03", "TRUST", "An alien message correctly predicts an eclipse.", "Do you trust its next claim?", option("More than before", "Verified knowledge earns weight.", "Update confidence.", { patternFollowing: 2 }), option("Only after another test", "One success is not a relationship.", "Demand repetition.", { consistency: 2 })),
      challenge("cosmic-04", "TRADE-OFF", "Your probe can collect images or a physical sample.", "Which returns more value?", option("Images", "Broad context with lower risk.", "Choose coverage.", { consistency: 2 }), option("A sample", "One object may transform knowledge.", "Choose depth.", { riskPreference: 2 })),
      challenge("cosmic-05", "PATTERN", "Three planets share identical storms.", "What is your first theory?", option("A shared cosmic cause", "One force may connect them.", "Unify the pattern.", { patternFollowing: 2 }), option("The data was duplicated", "Check the instrument pipeline.", "Verify the source.", { consistency: 2 })),
      challenge("cosmic-06", "RISK", "A signal offers coordinates beyond known space.", "Would you redirect the mission?", option("Follow the coordinates", "Discovery requires departure.", "Pursue the unknown.", { riskPreference: 2 }), option("Finish the mission first", "Protect the original objective.", "Honor the plan.", { consistency: 2 })),
      challenge("cosmic-07", "VISUAL", "A nebula resembles a perfect eye.", "How do you study it?", option("Measure its symmetry", "Quantify what seems designed.", "Test the image.", { consistency: 2 }), option("Compare ancient symbols", "The resemblance may echo history.", "Seek wider patterns.", { patternFollowing: 2 })),
      challenge("cosmic-08", "MYSTERY", "Your crew hears music where instruments detect silence.", "What do you investigate?", option("The crew's neural patterns", "The signal may act through minds.", "Inspect perception.", { hesitation: 2 }), option("The instruments' limits", "The signal may use unknown physics.", "Inspect detection.", { consistency: 2 })),
      challenge("cosmic-09", "TRADE-OFF", "First contact permits only one human question.", "What do you ask?", option("Why did you contact us?", "Understand their intention.", "Seek motive.", { hesitation: 2 }), option("What should we know?", "Let them choose the vital truth.", "Risk openness.", { riskPreference: 2 })),
      challenge("cosmic-10", "AMBIGUITY", "The universe may be sending a warning or an invitation.", "How do you answer?", option("With a cautious question", "Keep contact open without committing.", "Probe carefully.", { consistency: 2 }), option("With your own coordinates", "Trust begins with being findable.", "Make the bold reply.", { riskPreference: 2 })),
    ],
  },
];