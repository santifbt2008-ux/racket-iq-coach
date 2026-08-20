# Racket IQ

Build a modern, premium web application called RacketIQ.

CORE IDEA

RacketIQ is an AI-powered tennis equipment recommendation platform.

A tennis player answers questions about their level, playing style, physical preferences, current racket, and what they like/dislike about their current setup.

The app analyzes their answers against a structured tennis-racket database and recommends the best rackets for them.

The app should feel like a premium sports technology product, not a generic AI chatbot.

The primary goal of the MVP is:

Player answers questions → RacketIQ analyzes their profile → RacketIQ recommends the best 3 rackets → RacketIQ explains why → RacketIQ recommends a personalized string/tension/setup.

1. LANDING PAGE

Create a premium landing page.

Hero headline:

"Find the racket that actually fits your game."

Subheadline:

"Answer a few questions about your game and get a personalized racket, string, tension, and setup recommendation."

Primary CTA:

"Find My Racket →"

Secondary CTA:

"Explore Rackets"

Include a visual section showing the process:

Tell us about your game

Analyze your playing profile

Get your personalized setup

Include a section titled:

"Why RacketIQ?"

with:

Personalized recommendations

Racket-to-racket comparisons

String & tension recommendations

Customization recommendations

AI-powered explanations

Add a section showing an example recommendation:

94% Match

Yonex VCORE 98

"Built for players who want aggressive spin and speed while maintaining control and stability."

2. ONBOARDING / QUESTIONNAIRE

When the user clicks "Find My Racket", take them through a clean multi-step questionnaire.

Use a progress indicator such as:

Step 1 of 10

Do not put every question on one page.

Questions:

Player Profile

What is your tennis level?
Options:

Beginner

Intermediate

Advanced

Tournament Player

UTR 4–6

UTR 6–8

UTR 8–10

UTR 10+

How often do you play?

1–2 times/week

3–4 times/week

5+ times/week

Competitive training

Playing Style

Which best describes your game?

Aggressive baseliner

All-court player

Counterpuncher

Serve & volley

Defensive player

How would you describe your forehand?

Flat

Moderate topspin

Heavy topspin

What type of backhand do you use?

One-handed

Two-handed

How important is spin?
Use a 1–10 slider.

How important is control?
Use a 1–10 slider.

How much power do you want?
Use a 1–10 slider.

How important is stability?
Use a 1–10 slider.

How important is maneuverability?
Use a 1–10 slider.

Racket Preferences

Preferred head size:

95

98

100

102+

No preference

Preferred weight:

Under 300g

300–305g

305–310g

310g+

No preference

Preferred string pattern:

16x19

18x20

No preference

What do you currently play with?

Allow the user to search/select a racket from the database.

What do you like about your current racket?

Use a text field.

What do you dislike about your current racket?

Use a text field.

What do you want your next racket to improve?

Allow multiple selections:

More power

More control

More spin

Bigger sweet spot

More stability

Better maneuverability

More comfort

Better serve

Better feel

3. PLAYER PROFILE ANALYSIS

After the questionnaire, show a short loading/analysis screen.

Use messaging such as:

"Analyzing your game..."

Then:

"Comparing your profile against our racket database..."

Then:

"Building your personalized setup..."

Do not make this screen excessively long.

4. RESULTS PAGE

Create a premium results dashboard.

At the top:

"Your RacketIQ Match"

Display:

#1 MATCH

Yonex VCORE 98

94% Match

Show a large racket image placeholder.

Under it:

Why it fits your game

Give 3–5 personalized reasons based specifically on the user's answers.

For example:

Your heavy topspin preference matches the racket's spin-oriented design.

Your preference for control makes the 98 sq. in. head more appropriate than a larger power-oriented frame.

Its weight provides the stability you requested without becoming excessively difficult to maneuver.

Do NOT make generic explanations.

5. MATCH SCORE

Create a visual breakdown:

Overall Match — 94%

Then:

Spin — 95%
Control — 91%
Power — 84%
Stability — 93%
Maneuverability — 88%
Head Size — 97%
Weight — 94%

These scores should be calculated from the user's answers and racket attributes rather than randomly generated.

6. TOP 3 RECOMMENDATIONS

Below the primary recommendation, show:

#2 Match

Racket
Match %

#3 Match

Racket
Match %

Each should include:

Racket name

Brand

Match percentage

Short explanation

"View Details" button

7. PERSONALIZED STRING SETUP

Create a section:

Your Recommended Setup

String

Recommend an appropriate string based on the player's style.

Gauge

Recommend an appropriate gauge.

Tension

Recommend a reasonable tension RANGE rather than pretending there is one perfect tension.

Explain why the recommendation was made.

Example:

Luxilon ALU Power 1.25

Recommended tension: 48–52 lbs

"Recommended because you prioritize control and spin while still wanting enough response from the racket."

Do not make unsafe or unrealistic claims.

8. CUSTOMIZATION

Create a section:

Should You Customize It?

Recommend customization only when the player's needs justify it.

Potential recommendations:

Lead tape

Weight adjustment

Balance adjustment

Overgrip

Replacement grip

Dampener

Show:

Recommended customization

and explain:

Goal: Increase stability without significantly reducing maneuverability.

Do not recommend customization automatically.

9. COMPARE PAGE

Allow users to compare up to 3 rackets.

Create a comparison table with:

Head size

Weight

Balance

Swingweight

String pattern

Beam

Stiffness

Power

Control

Spin

Stability

Maneuverability

Recommended player type

Also show:

Which one is better for YOU?

Use the user's profile to explain the differences.

10. EXPLORE RACKETS PAGE

Create a searchable racket database.

Filters:

Brand

Head size

Weight

String pattern

Power

Control

Spin

Price range

Allow users to search for rackets.

Each racket should have its own detail page containing:

Racket name

Brand

Specifications

Performance ratings

Recommended player types

Pros

Considerations

Similar rackets

"See if this racket fits YOUR game"

11. DATA STRUCTURE

Create a structured racket database.

Each racket should contain:

id

brand

model

generation

head_size

weight

balance

swingweight

length

beam

string_pattern

stiffness

power_score

control_score

spin_score

stability_score

maneuverability_score

comfort_score

recommended_player_types

recommended_level

description

Initially populate the database with realistic sample data for approximately 30 popular tennis rackets.

Clearly structure the code so more rackets can easily be added later.

Do not invent real-world specifications and present them as verified facts. Mark sample/demo data clearly until it is replaced with verified specifications.

12. RECOMMENDATION ENGINE

Build the recommendation engine so that it compares:

Player Profile

against

Racket Attributes

The recommendation should consider:

Head size preference

Weight preference

Playing style

Spin preference

Control preference

Power preference

Stability preference

Maneuverability preference

Skill level

Current racket

What the player likes about their current racket

What the player dislikes about their current racket

Desired improvements

Create a transparent weighted scoring system.

Do NOT randomly select rackets.

Do NOT allow the AI to invent racket specifications.

The database should be the source of truth for racket specifications.

13. AI EXPLANATION

Use AI primarily for personalization and explanation.

The AI should receive:

User profile

Current racket

Desired improvements

Top racket matches

Verified racket specifications

The AI should then explain why each recommendation fits the player.

The AI must not invent specifications, prices, or performance claims.

If information is missing, say that it is unavailable rather than making it up.

14. DESIGN

Make the design feel like a premium sports technology company.

Style:

Minimal

Modern

Premium

Athletic

Clean

Professional

Use strong typography, generous spacing, subtle animations, rounded cards, and high-quality racket imagery/placeholders.

Avoid:

Cheap-looking gradients

Excessive animations

Clutter

Generic chatbot aesthetics

Cartoonish graphics

The interface should work beautifully on:

Desktop

Tablet

Mobile

15. USER EXPERIENCE

Make the questionnaire extremely easy to complete.

Use:

Large buttons

Sliders

Cards

Progress indicator

Back/Next navigation

Clear explanations

Save questionnaire answers during the session so the user does not lose progress.

Allow the user to restart the questionnaire.

16. FUTURE FEATURES

Structure the application so these can be added later:

User accounts

Saved rackets

Saved setups

Racket history

Tennis shoe recommendations

String database

String comparison

Tension calculator

Racket customization simulator

AI tennis equipment assistant

Retail/affiliate links

Premium subscription

Coach/academy accounts

Personalized equipment profiles

Do NOT build all of these now.

Build the MVP first.

17. IMPORTANT DEVELOPMENT RULE

Do not just create a static mockup.

Create a functioning application with:

Working navigation

Working questionnaire

Working recommendation calculations

Working results page

Working racket search

Working comparison system

Structured data that can be expanded later

Use clean, modular code so additional features can be added without rebuilding the application.

Start by building the complete MVP described above.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://racket-iq-coach.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c511d092-3f30-470a-9ba6-1779c43215b2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
