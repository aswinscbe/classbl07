window.CAMPUS_DATA = {
  bus: [
    ["08:55","C&D Housing","Phase V Campus","PGP Auditorium",false],
    ["09:15","PGP Auditorium","Phase V Campus","C&D Housing",true],
    ["10:25","C&D Housing","Phase V Campus","PGP Auditorium",false],
    ["10:25","PGP Auditorium","Phase V Campus","C&D Housing",true],
    ["10:37","C&D Housing","Phase V Campus","PGP Auditorium",false],
    ["11:30","PGP Auditorium","Phase V Campus","Main Gate",true],
    ["11:45","Main Gate","C&D Housing","PGP Auditorium",true],
    ["12:07","C&D Housing","Phase V Campus","PGP Auditorium",false],
    ["13:38","C&D Housing","Phase V Campus","PGP Auditorium",false],
    ["13:45","PGP Auditorium","Phase V Campus","Main Gate",true],
    ["14:05","Main Gate","C&D Housing","PGP Auditorium",true],
    ["14:17","C&D Housing","Phase V Campus","PGP Auditorium",false],
    ["15:00","PGP Auditorium","Phase V Campus","Main Gate",true],
    ["15:30","Main Gate","C&D Housing","PGP Auditorium",true],
    ["15:44","PGP Auditorium","Phase V Campus","C&D Housing",false],
    ["15:52","C&D Housing","Phase V Campus","PGP Auditorium",false],
    ["16:05","PGP Auditorium","Phase V Campus","Main Gate",true],
    ["17:00","Main Gate","C&D Housing","PGP Auditorium",true],
    ["17:20","PGP Auditorium","Phase V Campus","C&D Housing",false],
    ["17:52","C&D Housing","Phase V Campus","PGP Auditorium",false],
    ["18:00","PGP Auditorium","Phase V Campus","Main Gate",true],
    ["18:20","Main Gate","C&D Housing","PGP Auditorium",true],
    ["18:50","PGP Auditorium","Phase V Campus","C&D Housing",false],
    ["18:52","C&D Housing","Phase V Campus","PGP Auditorium",false],
    ["19:00","PGP Auditorium","Phase V Campus","Main Gate",true],
    ["20:00","Main Gate","C&D Housing","PGP Auditorium",true],
    ["20:10","PGP Auditorium","Phase V Campus","C&D Housing",false],
    ["20:15","C&D Housing","Phase V Campus","PGP Auditorium",false],
    ["20:25","PGP Auditorium","Phase V Campus","C&D Housing",false],
    ["21:00","Main Gate","C&D Housing","PGP Auditorium",true],
    ["21:20","PGP Auditorium","Phase V Campus","C&D Housing",false],
    ["21:50","PGP Auditorium","Phase V Campus","Main Gate",true],
    ["21:50","PGP Auditorium","Phase V Campus","C&D Housing",false],
    ["22:20","Main Gate","C&D Housing","PGP Auditorium",true],
    ["22:40","PGP Auditorium","Phase V Campus","Main Gate",true],
    ["23:00","Main Gate","C&D Housing","PGP Auditorium",true],
    ["23:20","PGP Auditorium","Phase V Campus","C&D Housing",false],
    ["23:40","PGP Auditorium","Phase V Campus","Main Gate",true],
    ["00:00","Main Gate","C&D Housing","PGP Auditorium",true]
  ].map(([time,from,via,to,mainGate])=>({time,from,via,to,mainGate})),
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
