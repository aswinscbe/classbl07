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
  /* Which sheet this menu came from, carried as data so the app can say so rather
     than leaving people to guess whether they are reading a stale menu. Update these
     two lines whenever the menu below is replaced. */
  messMeta: {
    label:"October 2026",
    effectiveIso:"2026-10-01",
    note:"Menu is tentative \u2014 items change with market availability."
  },
  /* IIM Kozhikode students' mess, October 2026 sheet. */
  mess: {
    monday: {
      breakfast:["Idli","Medu vada","Coconut chutney","Sambhar","Boiled egg","Choccos","Boiled pulses","Banana","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Green salad","Wheat chapati","Ash gourd dal","Broadbens aloo","Punjabi chole","Lemon rice","Plain rice","Rasam","Buttermilk","Pappad"],splVeg:"Golden corn gobhi dry",fishEgg:"Egg pepper roast"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","Basanti pulao","Masala dal","Fryums","Pickle"],dessert:"Gulab jamun",veg:"Kadai paneer",nonVeg:"Kadai chicken"}
    },
    tuesday: {
      breakfast:["Methi paratha","Pongal","Aalu matar sabji","Coconut chutney","Boiled egg","Cornflakes","Boiled pulses","Papaya","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Palak dal","Alu gobhi dry","Kadhi pakoda","Curry leaves rice","Plain rice","Sambar","Jeera buttermilk","Pappad"],splVeg:"Rajma masala",fishEgg:"Fish curry"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","Veg Manchurian","Snake gourd chenna dal dry","Schezuan fried rice","Moong dal thadka","Boondi raita","Fryums","Pickle"],dessert:"Ice cream (1 piece)"}
    },
    wednesday: {
      breakfast:["Masala dosa","Veg poha","Sambar","Coriander mint chutney","Boiled egg","Chocos","Boiled pulses","Watermelon","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Dal tadka","Guthi vangai","Veg kofta curry","Tomato rice","Plain rice","Rasam","Buttermilk","Pappad"],sweet:"M/dal halwa / carrot halwa",splVeg:"Soya curry",fishEgg:"Egg tikka masala"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","Kadala curry","Lowki tomatar","Veg biryani","Chana dal","Curd","Fryums","Pickle"],veg:"Palak paneer",nonVeg:"Pahdi chicken"}
    },
    thursday: {
      breakfast:["Kallappam / dal pakwana","Upma","Coriander mint chutney","Vegetable stew","Boiled egg","Corn flakes","Boiled pulses","Mixed fruits","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Bengal gram dal fry","Dum aloo banaras","Rajma raseela","Ghee rice (pulao)","Plain rice","Sambhar","Buttermilk","Pappad"],splVeg:"Besan gatte",fishEgg:"Fish curry (Nellore chepala pulusu)"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","Mutter masala","Mix veg poriyal","Jeera rice","Tomato pappu","Jeera buttermilk","Fryums","Pickle"],dessert:"Semiya kheer",veg:"Shahi paneer",nonVeg:"Chicken Kolhapuri"}
    },
    friday: {
      breakfast:["Aloo paratha","Veg wheat upma","Curd","Coriander mint chutney","Boiled egg","Chocos","Boiled pulses","Banana","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Dal makkani","Corn palak","Dondakai dum fry","Corn pulao","Plain rice","Rasam","Buttermilk","Pappad"],splVeg:"Bhindi kurkure",fishEgg:"Egg curry"},
      dinner:{combo:true,items:["Onion salad","Mirchi ka salan","Hyd paneer dum biryani","Hyd chicken dum biryani","Onion cucumber raita","Pickle"],dessert:"Fruit custard"}
    },
    saturday: {
      breakfast:["Uttapam","Semeya","Coriander mint chutney","Coconut chutney","Boiled egg","Cornflakes","Boiled pulses","Watermelon","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Yellow dal","Kadai veg dry","Paneer lababdar","Tamarind rice","Plain rice","Sambhar","Masala buttermilk","Pappad"],sweet:"Sweet boondi"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","Aloo mehthi dry","Chole masala","Bhagara rice","Dal tadka","Plain curd","Fryums","Pickle"],veg:"Peanut masala",nonVeg:"Egg Kolhapuri"}
    },
    sunday: {
      breakfast:["Pav","Ragi dosa","Bhaaji","Cococunt red chutney","Omelette","Chocos","Boiled pulses","Papaya","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Arhar dal","Honey chilli potato","Soya capsicum","Tawa pulao","Plain rice","Rasam","Jeera buttermilk","Pappad"],splVeg:"Lobia masala",fishEgg:"Kerala fish curry"},
      dinner:{combo:false,items:["Veg salad","Chapati / phulka","White peas kuruma","Aalu bhindi","Veg pulao","Dal maharani","Buttermilk","Fryums","Pickle"],dessert:"Balushahi",veg:"Paneer tikka masala",nonVeg:"Chickrn tikka masala"}
    }
  }
};
