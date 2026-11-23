# AI reflection

## How I used it

- Planned first: before any code, we agreed a written plan covering the
  stack, the design decisions and 11 build steps. I reviewed it and made the
  choices it raised (project location, search on a button, a field per term).
- Then built it one step at a time: it researched the real API with curl,
  proposed each change, I approved it, and I ran every command myself.

## Where I steered it

- Asked whether the timeout was needed at all and how to justify it; it
  backed it with what we had seen and public reports. I decided to keep it, as that would make the app
  work better for the final user.
- Asked for anything over-engineered to be simplified, which removed
  an unused field, duplicate tests and several small API helpers.

## What it got wrong, and how I caught it

- Kept the old page on screen while the next one loaded, so page 1's articles
  were numbered 26–50. I spotted it while paging, asked why, and we replaced
  it with a loading spinner.
- Let Search be pressed again for the same query. I asked for it to stay
  unavailable until the query changes; it then suggested `aria-disabled`
  rather than `disabled`, so keyboard focus isn't lost.

## What I learned / would do again

- Small, reviewed steps kept me in control and made each change easy to
  explain and understand. I checked every line of code. It took time, but it
  was worth it: I understand the logic, and I could shape the code to work
  better for me and for the users.
- AI writes code quickly, so the effort moves to reviewing it, questioning it,
  and cutting what isn't needed.
- I turned each correction into a rule in my Claude instructions, so the
  next project starts from the improved version.
