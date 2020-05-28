var BudgetControl = (function(){

    //Expense Constructor
    var Expense = function(id,des,value){
        this.id = id;
        this.des = des;
        this.value = value;
    }

    //Income Constructor
    var Income = function(id,des,value){
        this.id = id;
        this.des = des;
        this.value = value;
    }

    //Data Structure
    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
    };

    var calculateTotal = function(type) {
        var sum = 0;
         data.allItems[type].forEach(function(cur){
            sum = sum + cur.value ;
         })
         data.totals[type] = sum;
    }

    return{
        addItem : function(type,des,value){
            var id,newItem;
            //Create Id
            if(data.allItems[type].length > 0 ){
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                id = 0;
            }

            //create new Item
            if(type =='exp'){
                newItem = new Expense(id,des,value);
            }else if(type == 'inc'){
                newItem = new Income(id,des,value);
            }

            //push newItem into data Structure 
            data.allItems[type].push(newItem);

            //return newItem
            return newItem;
        },
        deleteItem : function(type,id){
            var ids,index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        calculateBudget : function(){
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
        },
        getBudget : function(){
            return {
                budget : data.budget,
                income : data.totals.inc,
                expense : data.totals.exp
            };
        }

    };
})();


var UIcontrol = (function(){
    var DOMStrings = {
        inputType : ".add_type",
        inputDescription : ".item_description",
        value : ".item_value",
        inputButton : ".add_btn",
        incomeContainer : ".incomeDetail",
        expenseContainer : ".expenseDetail",
        totalIncomeContainer : ".topIncomeRight",
        totalExpenseContainer : ".topExpenseRight",
        totalBugetContainer : ".topBudget",
        container : ".bottom"
    };

    var formatNumber = function(num , type){
        //1500 -> +1,500.00
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        
        if(int.length > 3){
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
        }

        dec = numSplit[1];

        return (type == 'inc' ? '+' : '-') + int + '.' + dec ;
    }
    return {
        getInput : function(){
            return{
                type : document.querySelector(DOMStrings.inputType).value,
                item_description : document.querySelector(DOMStrings.inputDescription).value,
                item_value : parseFloat(document.querySelector(DOMStrings.value).value)
            };
        },
        clearField : function(){
            var fields,fieldArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.value);
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function(current,index,Array){
                current.value = "";
            });
            fieldArr[0].focus();
        },
        addItem : function(obj,type){
            var html,newHtml,element;
            if(type == 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="income_element" id="inc-%id%"> <div class="incomeDescription"> %description% </div> <div class="incomeValue"> %value% <img class="deleteIcon" width="25px" height="auto" src="Icons/delete.png"> </div> </div>';
            }else if(type=='exp'){
                element = DOMStrings.expenseContainer;
                html = '<div class="expense_element" id="exp-%id%"> <div class="expenseDescription"> %description% </div> <div class="expenseValue"> %value% <img class="deleteIcon" width="25px" height="auto" src="Icons/delete.png"> </div> </div>';
            }
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.des);
            newHtml = newHtml.replace('%value%',formatNumber( obj.value , type));
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteItem : function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        getDOMStrings : function(){
            return DOMStrings;
        },
        displayBudget : function(obj){
            var type = obj.budget >= 0 ? 'inc' : 'exp' ;
            document.querySelector(DOMStrings.totalBugetContainer).textContent =formatNumber( obj.budget , type);
            document.querySelector(DOMStrings.totalIncomeContainer).textContent = formatNumber(obj.income ,'inc');
            document.querySelector(DOMStrings.totalExpenseContainer).textContent =formatNumber(obj.expense,'exp');
        },
    };

})();

var Conroller = (function(BudgtCtrl,UICtrl){

    var setupEventListner = function (){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputButton).addEventListener("click",Add_item);
        document.addEventListener("keypress",(function(event){
            if(event.keyCode === 13)
            {
                Add_item();
            }
        }));
        document.querySelector(DOM.container).addEventListener('click',Delete_item);
    }

    var updateBudget = function(){
        BudgtCtrl.calculateBudget();
        budget = BudgtCtrl.getBudget();
        UICtrl.displayBudget(budget);
    }

    var Delete_item = function(event){
        var itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            BudgtCtrl.deleteItem(type,ID);
            UICtrl.deleteItem(itemID);
            updateBudget();
        }
    }
    var Add_item = function(){
        var input = UICtrl.getInput();
        
        if(input.item_description !="" && !isNaN(input.item_value) && input.item_value>0){
            
            var newItem = BudgtCtrl.addItem(input.type,input.item_description,input.item_value);

            UICtrl.addItem(newItem,input.type);

            UICtrl.clearField();

            updateBudget();
        
        }
    }

    return {
        init : function(){
            console.log("App started");
            (function(){
                const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                var d = new Date();
                document.querySelector('.month').innerHTML=monthNames[d.getMonth()];
                document.querySelector('.year').innerHTML=d.getFullYear();
            })();
            UICtrl.displayBudget({
                budget : 0,
                income : 0,
                expense : 0
            });
            setupEventListner();
        }
    };

})(BudgetControl,UIcontrol);


Conroller.init();