/* IIMK Staff Mini Bus (shuttle service) — Main Gate <-> Arjuna Statue via Phase V,
   w.e.f. May 2025. Confirmed/live schedule (not tentative), merged straight into
   the same bus board as the student routes — each trip carries staff:true so
   busRow() can show a "STAFF" tag distinguishing it from the student service.
   2:30pm (Arjuna Statue loop trip) is intentionally omitted — out of scope for
   the student-facing board. Source: campus notice board photo, transcribed and
   confirmed by the user (from/to/via corrected against the printed "Main
   Office"/"Resi Hill"/"Apt-1" wording, which doesn't match this app's stop names). */
window.STAFF_BUS_DATA = [
  {time:"07:45",from:"Main Gate",to:"Arjuna Statue"},
  {time:"08:00",from:"Arjuna Statue",via:"Phase V Campus",to:"Main Gate"},
  {time:"08:30",from:"Main Gate",to:"Arjuna Statue"},
  {time:"08:42",from:"Arjuna Statue",to:"Phase V Campus"},
  {time:"10:15",from:"Arjuna Statue",to:"Phase V Campus"},
  {time:"10:40",from:"Arjuna Statue",to:"Main Gate"},
  {time:"11:50",from:"Main Gate",to:"Arjuna Statue"},
  {time:"13:05",from:"Arjuna Statue",via:"Phase V Campus",to:"Main Gate"},
  {time:"13:50",from:"Main Gate",via:"Phase V Campus",to:"Arjuna Statue"},
  {time:"15:30",from:"Arjuna Statue",via:"Phase V Campus",to:"Main Gate"},
  {time:"16:15",from:"Main Gate",via:"Phase V Campus",to:"Arjuna Statue"},
  {time:"16:45",from:"Arjuna Statue",to:"Main Gate"},
  {time:"17:15",from:"Main Gate",to:"Arjuna Statue"},
  {time:"17:40",from:"Arjuna Statue",via:"Phase V Campus",to:"Main Gate"},
  {time:"18:00",from:"Main Gate",to:"Arjuna Statue"},
  {time:"18:30",from:"Arjuna Statue",via:"Phase V Campus",to:"Main Gate"},
  {time:"19:30",from:"Main Gate",via:"Phase V Campus",to:"Arjuna Statue"},
  {time:"20:30",from:"Arjuna Statue",via:"Phase V Campus",to:"Main Gate"},
  {time:"21:30",from:"Main Gate",via:"Phase V Campus",to:"Arjuna Statue"},
  {time:"21:55",from:"Arjuna Statue",to:"Main Gate"}
].map(t=>({...t,staff:true}));
if(window.CAMPUS_DATA)window.CAMPUS_DATA.bus=window.CAMPUS_DATA.bus.concat(window.STAFF_BUS_DATA);
