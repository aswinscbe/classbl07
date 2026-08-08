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
      breakfast:["Idli","Medu vada","Coconut chutney","Sambar","Boiled egg","Banana","Bread, butter & jam","Tea / coffee / milk"],
      lunch:["Veg salad","Wheat chapati","Dal fry","Carrot peas poriyal","Punjabi chole","Lemon rice","Plain rice","Rasam","Curd","Pappad","Gulab jamun","Golden gobi corn dry","Bengali fish curry"],
      dinner:["Combo menu","Kimchi salad","Wheat chapati / phulka","Fried rice","Masala dal","Buttermilk","Fryums","Pickle","Paneer Manchurian / Paneer Jalfrezi","Chicken Manchurian / Chicken Jalfrezi"]
    },
    tuesday: {
      breakfast:["Missi paratha","Pongal","Spiced curd","Coconut chutney","Boiled egg","Cut fruits / papaya","Bread, butter & jam","Tea / coffee / milk"],
      lunch:["Veg salad","Wheat chapati","Palak dal","Kootu curry (yam)","Kadi pakoda","Baghara rice","Plain rice","Sambar","Jeera buttermilk","Pappad","Rajma masala"],
      dinner:["Veg salad","Wheat chapati / phulka","Veg Manchurian / chana goli","Lobiya masala","Basundi pulao","Moong dal tadka","Jeera buttermilk","Fryums","Ice cream","Pickle","Paneer masala","Chicken masala"]
    },
    wednesday: {
      breakfast:["Masala dosa","Veg poha","Sambar","Coriander chutney","Boiled egg","Banana","Bread, butter & jam","Tea / coffee / milk"],
      lunch:["Veg salad","Wheat chapati","Maa ki dal","Pumpkin lobiya dry","Veg Kolhapuri","Ghee rice / pulao","Plain rice","Rasam","Buttermilk","Pappad","Palada / carrot halwa","Gatte ki sabji"],
      dinner:["Veg toss salad","Kerala paratha / phulka","Lobiya masala","Mixed veg poriyal","Soya biryani","Chana dal fry","Curd","Fryums","Pickle","Paneer masala","Chicken Kolhapuri"]
    },
    thursday: {
      breakfast:["Vada pav","Semiya upma","Mint chutney","Coconut chutney","Omelette","Cut fruits / watermelon","Bread, butter & jam","Tea / coffee / milk"],
      lunch:["Veg salad","Wheat chapati","Bengal gram dal fry","Soya capsicum greens","Rajma raseela","Tomato rice","Plain rice","Sambar","Buttermilk","Pappad","Peanut-green gram curry","Egg tikka masala"],
      dinner:["Veg salad","Wheat chapati / phulka","Mutter masala","Mirchi ka salan","Corn veg pulao","Tomato pappu","Buttermilk","Fryums","Moong dal halwa","Pickle","Shahi paneer","Egg Kolhapuri"]
    },
    friday: {
      breakfast:["Aloo paratha","Wheat upma","Curd","Coconut chutney","Boiled egg","Cut fruits / papaya","Bread, butter & jam","Tea / coffee / milk"],
      lunch:["Veg salad","Chapati / phulka","Dal makhani","Green gram kootu dry","Aloo Amritsari","Tawa pulao","Plain rice","Rasam","Buttermilk","Pappad","Soya chunk curry","Kerala fish curry"],
      dinner:["Combo menu","Veg onion salad","Wheat chapati / phulka","Hyd paneer dum biryani","Hyd chicken dum biryani","Onion cucumber raita","Fryums","Semiya kheer","Pickle","Soya paneer butter masala","Butter chicken"]
    },
    saturday: {
      breakfast:["Uttapam","Veg upma","Veg stew","Coconut chutney","Boiled egg","Banana","Bread, butter & jam","Tea / coffee / milk"],
      lunch:["Veg salad","Chapati / phulka","Yellow dal","Kadai veg dry","Paneer makhan masala","Plain biryani / kushka","Plain rice","Sambar","Sweet lassi","Pappad"],
      dinner:["Veg salad","Wheat chapati","Chole masala","Aloo karam dry","Mishti pulao","Dal makhani","Plain curd","Fryums","Fruit custard","Pickle","Soya","Egg Kolhapuri"]
    },
    sunday: {
      breakfast:["Pav / Misal pav (alternate week)","Ragi dosa","Bhaji","Coconut chutney","Boiled egg","Cut fruits / watermelon","Bread, butter & jam","Tea / coffee / milk"],
      lunch:["Veg salad","Chapati / phulka","Arhar dal","Honey chilli potato","Kadala curry","Coconut pulao","Plain rice","Rasam","Jeera buttermilk","Pappad","Masala peanut fry","Egg bhurji"],
      dinner:["Veg kosambari salad","Wheat chapati","White peas kuruma","Long beans thoran","Veg pulao","Dal panchmel","Buttermilk","Badushahi","Pickle","Paneer butter masala","Butter chicken"]
    }
  }
};
