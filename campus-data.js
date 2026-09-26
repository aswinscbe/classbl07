window.CAMPUS_DATA = {
  /* Student bus timetable, transcribed from the official sheet (w.e.f. 09.06.2026).
     Each trip is its full stop sequence, not a from/via/to triple: 20 of the 41 trips
     call at four stops, which the old three-field shape could not hold — every Main
     Gate extension silently lost its C&D Housing stop. A stop carries its own clock
     time where the sheet prints one, so arrival is read rather than estimated. */
  bus: [
    ["08:55",[["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]],
    ["09:05",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]]],
    ["10:25",[["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]],
    ["10:35",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]]],
    ["10:37",[["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]],
    ["11:00",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"],["Main Gate"]]],
    ["11:45",[["Main Gate"],["C&D Housing"],["Phase V Campus","11:55"],["PGP Auditorium"]]],
    ["12:07",[["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]],
    ["12:08",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]]],
    ["13:35",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]]],
    ["13:38",[["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]],
    ["13:45",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"],["Main Gate"]]],
    ["14:05",[["Main Gate"],["C&D Housing"],["Phase V Campus","14:10"],["PGP Auditorium"]]],
    ["14:15",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]]],
    ["14:17",[["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]],
    ["15:00",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"],["Main Gate"]]],
    ["15:30",[["Main Gate"],["C&D Housing"],["Phase V Campus","15:40"],["PGP Auditorium"]]],
    ["15:50",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]]],
    ["15:52",[["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]],
    ["16:15",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"],["Main Gate"]]],
    ["17:00",[["Main Gate"],["C&D Housing"],["Phase V Campus","17:10"],["PGP Auditorium"]]],
    ["17:20",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]]],
    ["17:22",[["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]],
    ["18:00",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"],["Main Gate"]]],
    ["18:20",[["Main Gate"],["C&D Housing"],["Phase V Campus","18:30"],["PGP Auditorium"]]],
    ["18:50",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]]],
    ["18:52",[["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]],
    ["19:00",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"],["Main Gate"]]],
    ["20:00",[["Main Gate"],["C&D Housing","20:05"],["Phase V Campus"],["PGP Auditorium"]]],
    ["20:10",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]]],
    ["20:15",[["C&D Housing"],["Phase V Campus","20:20"],["PGP Auditorium"]]],
    ["20:25",[["PGP Auditorium"],["Phase V Campus","20:30"],["C&D Housing"],["Main Gate"]]],
    ["21:00",[["Main Gate"],["C&D Housing"],["Phase V Campus","21:10"],["PGP Auditorium"]]],
    ["21:30",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]],true],
    ["21:50",[["PGP Auditorium"],["Phase V Campus","21:55"],["C&D Housing"],["Main Gate"]]],
    ["22:20",[["Main Gate"],["C&D Housing"],["Phase V Campus","22:30"],["PGP Auditorium"]]],
    ["22:40",[["PGP Auditorium"],["Phase V Campus","22:45"],["C&D Housing"],["Main Gate"]]],
    ["23:00",[["Main Gate"],["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]],
    ["23:20",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"]],true],
    ["23:30",[["PGP Auditorium"],["Phase V Campus"],["C&D Housing"],["Main Gate"]]],
    ["00:00",[["Main Gate"],["C&D Housing"],["Phase V Campus"],["PGP Auditorium"]]]
  ].map(([time,stops,returnsToPgp])=>{
    const seq=stops.map(([name,at])=>({name,at:at||null}));
    /* from/via/to stay for the code that predates the stops array. */
    return{time,stops:seq,from:seq[0].name,via:seq[1]?seq[1].name:null,
      to:seq[seq.length-1].name,mainGate:seq.some(s=>s.name==="Main Gate"),
      returnsToPgp:!!returnsToPgp};
  }),
  mess: {
    monday: {
      breakfast:["Idli","Medu vada","Coconut chutney","Sambar","Boiled egg","Chocos","Boiled pulses","Banana","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Dal fry","Yam thawa fry","Punjabi chole","Lemon rice","Plain rice","Rasam","Curd","Pappad"],splVeg:"Golden corn gobhi dry",fishEgg:"Egg pepper roast"},
      dinner:{combo:true,items:["Veg salad","Chapati / phulka","Fried rice (basmati)","Masala dal","Fryums","Pickle"],dessert:"Gulab jamun",veg:"Chilli paneer",nonVeg:"Chilli chicken"}
    },
    tuesday: {
      breakfast:["Methi paratha","Pongal","Aalu matar sabji","Coconut chutney","Boiled egg","Cornflakes","Boiled pulses","Papaya","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Palak dal","Aalu gobhi dry","Kadhi pakoda","Curry leaves rice","Plain rice","Sambar","Jeera buttermilk","Pappad"],splVeg:"Rajma masala",fishEgg:"Bengali fish curry"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","Veg Manchurian","Snake gourd chenna dal dry","Basundi pulao","Moong dal tadka","Boondi raita","Fryums","Pickle"],dessert:"Ice cream (1 piece)"}
    },
    wednesday: {
      breakfast:["Masala dosa","Veg poha","Sambar","Coriander chutney","Boiled egg","Chocos","Boiled pulses","Watermelon","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Dal tadka","Pumpkin lobia dry","Veg kofta curry","Tomato rice","Plain rice","Rasam","Buttermilk","Pappad"],sweet:"Carrot halwa",splVeg:"Soya curry",fishEgg:"Egg tikka masala"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","Kadala curry","Lauki tomatar","Veg biryani","Chana dal","Curd","Fryums","Pickle"],veg:"Kadai paneer",nonVeg:"Kadai chicken"}
    },
    thursday: {
      breakfast:["Vada pav","Pongal","Coriander mint chutney","Tangy imli chutney","Omelette","Corn flakes","Boiled pulses","Guava","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Bengal gram dal fry","Aloo Amritsari","Rajma raseela","Ghee rice (pulao)","Plain rice","Sambar","Buttermilk","Pappad"],splVeg:"Besan gatte",fishEgg:"Fish curry (Nellore chepala pulusu)"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","Mutter masala","Mix veg poriyal","Corn pulao","Tomato pappu","Jeera buttermilk","Fryums","Pickle"],dessert:"Semiya kheer",veg:"Shahi paneer",nonVeg:"Chicken Kolhapuri"}
    },
    friday: {
      breakfast:["Aloo paratha","Veg wheat upma","Curd","Coriander mint chutney","Boiled egg","Chocos","Boiled pulses","Banana","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Dal makkani","Greens green moong kootu (dry)","Kashmiri dum aloo","Jeera rice","Plain rice","Rasam","Buttermilk","Pappad"],splVeg:"Bhindi kurkure",fishEgg:"Egg curry"},
      dinner:{combo:true,items:["Onion salad","Mirchi ka salan","Hyd paneer dum biryani","Hyd chicken dum biryani","Onion cucumber raita","Pickle"],dessert:"Fruit custard"}
    },
    saturday: {
      breakfast:["Uttapam","Semeya","Coriander mint chutney","Coconut chutney","Boiled egg","Cornflakes","Boiled pulses","Watermelon","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Yellow dal","Kadai veg dry","Paneer makkan masala","Tamarind rice","Plain rice","Sambar","Masala buttermilk","Pappad"],sweet:"Sweet boondi"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","Aloo capsicum","Chole masala","Bhagara rice","Dal tadka","Plain curd","Fryums","Pickle"],veg:"Peanut masala",nonVeg:"Egg Kolhapuri"}
    },
    sunday: {
      breakfast:["Pav","Ragi dosa","Bhaji","Coconut red chutney","Boiled egg","Chocos","Boiled pulses","Papaya","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Arhar dal","Honey chilli potato","Soya capsicum","Tawa pulao","Plain rice","Rasam","Jeera buttermilk","Pappad"],splVeg:"Lobia masala",fishEgg:"Kerala fish curry"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","White peas kuruma","Aloo bhindi","Veg pulao","Dal maharani","Buttermilk","Fryums","Pickle"],dessert:"Balushahi",veg:"Paneer butter masala",nonVeg:"Butter chicken"}
    }
  }
};
