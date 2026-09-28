/* International Immersion Module — Oct 2026, Section A, Barcelona campus.
   Source: ESADE "Appendix I — Tentative Schedule" (the final grid supplied by the
   school), replacing the earlier proposal agenda. Local overlay, same pattern as
   exam-data.js, since this module isn't in the synced schedule feed.

   Two caveats carried from the source document, both worth re-checking before
   anyone travels:
   - Course A's header reads "Barcelona Campus or Madrid Campus"; Barcelona is
     used here per the earlier confirmation, but the school has not picked one.
   - The sheet is titled "Tentative Schedule" and both pages footnote "The exact
     session and flow to be defined", so session order within a day may still move.

   Session times follow the bands printed down the left of the grid: 09:30–13:00
   mornings (a coffee break sits inside it, not modelled as its own row), 14:00–15:30
   afternoons, and 15:30–17:00 for the one late block. */
window.IMMERSION_CLASSES = [
  // Course A — International Business, an European Perspective (5–9 Oct)
  {dateIso:"2026-10-05",startTime:"09:30",endTime:"10:00",code:"IBEU",course:"Welcome",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-05",startTime:"10:00",endTime:"13:00",code:"IBEU",course:"Introduction to the History, Economy and Beauty of Barcelona and Spain",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-06",startTime:"09:30",endTime:"13:00",code:"IBEU",course:"Introduction to the Social, Political and Economic Environment in the EU",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-06",startTime:"18:00",endTime:"20:00",code:"IBEU",course:"Barcelona Challenge & Welcome Dinner",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-07",startTime:"09:30",endTime:"13:00",code:"IBEU",course:"How to Structure International Business",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-07",startTime:"14:00",endTime:"15:30",code:"IBEU",course:"Guest Speaker or Company Visit",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-08",startTime:"09:30",endTime:"13:00",code:"IBEU",course:"Non-market Strategies in International Business",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-08",startTime:"14:00",endTime:"15:30",code:"IBEU",course:"Non-market Strategies in International Business",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-09",startTime:"09:30",endTime:"13:00",code:"IBEU",course:"Managing International Collaboration",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},

  /* Course B2 — Sustainability (12–16 Oct). Monday 12 Oct carries no sessions in
     the final grid — the earlier proposal had it running, which is the biggest
     change between the two versions. */
  {dateIso:"2026-10-13",startTime:"09:30",endTime:"13:00",code:"SUST",course:"New Trends in Sustainable and Regenerative Business",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-13",startTime:"14:00",endTime:"15:30",code:"SUST",course:"Disruptive Innovation & Exponential Technologies",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-13",startTime:"15:30",endTime:"17:00",code:"SUST",course:"Disruptive Innovation & Exponential Technologies",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-14",startTime:"09:30",endTime:"13:00",code:"SUST",course:"Social Entrepreneurship & Impact Investing",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-14",startTime:"14:00",endTime:"15:30",code:"SUST",course:"Guest Speaker or Company Visit",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-15",startTime:"09:30",endTime:"13:00",code:"SUST",course:"Managing Sustainable Collaboration",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-15",startTime:"14:00",endTime:"15:30",code:"SUST",course:"Managing Sustainable Collaboration",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  /* Friday's morning band holds Group Work and Final Presentations with the
     Program Closing marked at its foot; the split below keeps both inside the
     printed 09:30–13:00 band. */
  {dateIso:"2026-10-16",startTime:"09:30",endTime:"12:30",code:"SUST",course:"Group Work & Final Presentations",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"},
  {dateIso:"2026-10-16",startTime:"12:30",endTime:"13:00",code:"SUST",course:"Program Closing",venue:"Barcelona Campus",type:"Core",section:"A",status:"Scheduled"}
];
