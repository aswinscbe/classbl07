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
      lunch:{items:["Veg salad","Wheat chapati","Dal fry","Carrot peas poriyal","Punjabi chole","Lemon rice","Plain rice","Rasam","Curd","Pappad"],sweet:"Gulab jamun",splVeg:"Golden gobi corn dry",fishEgg:"Bengali fish curry"},
      dinner:{combo:true,items:["Kimchi salad","Wheat chapati / phulka","Fried rice","Masala dal","Buttermilk","Fryums","Pickle"],dessert:"Ice cream (50ml)",veg:"Paneer Manchurian / Paneer Jalfrezi",nonVeg:"Chicken Manchurian / Chicken Jalfrezi"}
    },
    tuesday: {
      breakfast:["Missi paratha","Pongal","Spiced curd","Coconut chutney","Boiled egg","Cornflakes","Boiled pulses","Cut fruits / papaya","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Palak dal","Kootu curry (yam)","Kadi pakoda","Baghara rice","Plain rice","Sambar","Jeera buttermilk","Pappad"],splVeg:"Rajma masala",fishEgg:"Egg pepper roast"},
      dinner:{combo:false,items:["Veg salad","Wheat chapati / phulka","Veg Manchurian","Lobiya masala","Basundi pulao","Moong dal tadka","Jeera buttermilk","Fryums","Pickle"],dessert:"Ice cream (50ml)",veg:"Paneer masala",nonVeg:"Chicken masala"}
    },
    wednesday: {
      breakfast:["Masala dosa","Veg poha","Sambar","Coriander chutney","Boiled egg","Chocos","Boiled pulses","Banana","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Maa ki dal","Pumpkin lobiya dry","Veg Kolhapuri","Ghee rice / pulao","Plain rice","Rasam","Buttermilk","Pappad"],sweet:"Palada / carrot halwa",splVeg:"Gatte ki sabji",fishEgg:"Fish curry (Nellore chepala pulusu)"},
      dinner:{combo:true,items:["Veg toss salad","Kerala paratha / phulka","Lobiya masala","Mixed veg poriyal","Soya biryani","Chana dal fry","Curd","Fryums","Pickle"],veg:"Paneer masala",nonVeg:"Chicken Kolhapuri"}
    },
    thursday: {
      breakfast:["Vada pav","Semiya upma","Mint chutney","Coconut chutney","Omelette","Cornflakes","Boiled pulses","Cut fruits / watermelon","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Wheat chapati","Bengal gram dal fry","Soya capsicum greens","Rajma raseela","Tomato rice","Plain rice","Sambar","Buttermilk","Pappad"],splVeg:"Peanut-green gram curry",fishEgg:"Egg tikka masala"},
      dinner:{combo:false,items:["Veg salad","Wheat chapati / phulka","Mutter masala","Mirchi ka salan","Corn veg pulao","Tomato pappu","Buttermilk","Fryums","Pickle"],dessert:"Moong dal halwa",veg:"Shahi paneer",nonVeg:"Egg Kolhapuri"}
    },
    friday: {
      breakfast:["Aloo paratha","Wheat upma","Curd","Coconut chutney","Boiled egg","Chocos","Boiled pulses","Cut fruits / papaya","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Chapati / phulka","Dal makhani","Green gram kootu dry","Aloo Amritsari","Tawa pulao","Plain rice","Rasam","Buttermilk","Pappad"],splVeg:"Soya chunk curry",fishEgg:"Kerala fish curry"},
      dinner:{combo:true,items:["Veg onion salad","Wheat chapati / phulka","Hyd paneer dum biryani","Hyd chicken dum biryani","Onion cucumber raita","Fryums","Pickle"],dessert:"Semiya kheer",veg:"Soya paneer butter masala",nonVeg:"Butter chicken"}
    },
    saturday: {
      breakfast:["Uttapam","Veg upma","Veg stew","Coconut chutney","Boiled egg","Cornflakes","Boiled pulses","Banana","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Chapati / phulka","Yellow dal","Kadai veg dry","Paneer makhan masala","Plain biryani / kushka","Plain rice","Sambar","Sweet lassi","Pappad"]},
      dinner:{combo:false,items:["Veg salad","Wheat chapati","Chole masala","Aloo karam dry","Mishti pulao","Dal makhani","Plain curd","Fryums","Pickle"],dessert:"Fruit custard",veg:"Soya",nonVeg:"Egg Kolhapuri"}
    },
    sunday: {
      breakfast:["Pav / Misal pav (alternate week)","Ragi dosa","Bhaji","Coconut chutney","Boiled egg","Chocos","Boiled pulses","Cut fruits / watermelon","Bread, butter & jam","Tea / coffee / milk"],
      lunch:{items:["Veg salad","Chapati / phulka","Arhar dal","Honey chilli potato","Kadala curry","Coconut pulao","Plain rice","Rasam","Jeera buttermilk","Pappad"],splVeg:"Masala peanut (fry)",fishEgg:"Egg bhurji"},
      dinner:{combo:false,items:["Veg kosambari salad","Wheat chapati","White peas kuruma","Long beans thoran","Veg pulao","Dal panchmel","Buttermilk","Pickle"],dessert:"Badushahi",veg:"Paneer butter masala",nonVeg:"Butter chicken"}
    }
  }
};
