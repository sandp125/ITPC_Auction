function mainApplication(){

	var thisObj = this;

	thisObj.windowWidth = 0;
  	thisObj.windowHeight = 0;

    thisObj.menuId = '';

    //thisObj.URL = 'http://localhost:5000/chaincode';
	//thisObj.URL = 'https://a7640456-e643-4225-9d72-e6c332443b1b_vp1-api.blockchain.ibm.com:443/chaincode';

	thisObj.init = function(){
		console.log('INIT MAIN APPLICATION');
		thisObj.setPrimaryEvents();

		if($('body').attr('name')=='front'){
			thisObj.getFrontList();
		}

		//v2.2
		if($('body').hasClass('page-category')){
			thisObj.setCategoryAttrs();
			thisObj.getCategoryList();
		}

		//v2.2
		thisObj.getCategories();

		$(window).resize(function(){
			thisObj.calculateSize();
			thisObj.resizeDOM();
		});

		thisObj.calculateSize();
		thisObj.resizeDOM();

	}

	thisObj.calculateSize = function(){
		thisObj.windowWidth = $(window).width();
  		thisObj.windowHeight = $(window).height();
	}

	thisObj.resizeDOM = function(){

	}

	thisObj.setPrimaryEvents = function(){

		//MENUS
		$('.header-branding').click(function(){
			thisObj.loadFront();
		});

		$('.header-menu .primary-event').click(function(){
			var actionItem = $(this);
			actionItem.parent().siblings().each(function(index){thisObj.closeMenu($(this))});
			actionItem.parent().toggleClass('active');
		});

		$('.header-menu .action-load-form').click(function(){
			var actionItem = $(this);
			formApp.loadForm(actionItem);
		});

		$('.header-menu .action-load-page').click(function(){
			var actionItem = $(this);
			thisObj.loadPage(actionItem);
		});

		$('.header-menu .action-load-list').click(function(){
			var actionItem = $(this);
			thisObj.loadList(actionItem);
		});

		//MAIN
		$('.site-main').click(function(){
			thisObj.closeMenus();
		});

		//BUTTONS
		$('.action-button[action-type="form"]').click(function(){
			var actionItem = $(this);
			var actionParent = actionItem.parents('.item');
			var actionId = actionParent.attr('item-id');
			formApp.loadForm(actionItem,'?item-id='+actionId);
		});

		$('.action-button[action-type="detail"]').click(function(){
			var actionItem = $(this);
			var actionParent = actionItem.parents('.item');
			var actionId = actionParent.attr('item-id');
			formApp.loadForm(actionItem,'?item-id='+actionId);
		});

		//FOOTER
		$('.site-footer').click(function(){
			thisObj.closeMenus();
		});

		//FRONT VIEW NAV
		$('.front-header .nav-arrow.left').click(function(){
			thisObj.frontLeft();
		});

		$('.front-header .nav-arrow.right').click(function(){
			thisObj.frontRight();
		});

		$('.front-header').mousewheel(function(event, delta){
			thisObj.frontWheel($(this),event,delta);
		});

	}

	thisObj.setCategoryMenuEvents = function(){
		$('.header-menu .action-load-category').click(function(){
			var actionItem = $(this);
			thisObj.loadCategory(actionItem);
		});
	}

	thisObj.setFrontListEvents = function(){

		$('.front-header .item .action-button[action-type="form"]').click(function(){
			var actionItem = $(this);
			var actionParent = actionItem.parents('.item');
			var actionId = actionParent.attr('item-id');
			formApp.loadForm(actionItem,'?item-id='+actionId);
		});

		$('.front-header .item .action-button[action-type="detail"]').click(function(){
			var actionItem = $(this);
			var actionParent = actionItem.parents('.item');
			var actionId = actionParent.attr('item-id');
			formApp.loadForm(actionItem,'?item-id='+actionId);
		});
	}

	thisObj.setCategoryListEvents = function(){

		$('.category-content .item .action-button[action-type="form"]').click(function(){
			var actionItem = $(this);
			var actionParent = actionItem.parents('.item');
			var actionId = actionParent.attr('item-id');
			formApp.loadForm(actionItem,'?item-id='+actionId);
		});

		$('.category-content .item .action-button[action-type="detail"]').click(function(){
			var actionItem = $(this);
			var actionParent = actionItem.parents('.item');
			var actionId = actionParent.attr('item-id');
			formApp.loadForm(actionItem,'?item-id='+actionId);
		});
	}



	//MENUS

	thisObj.loadFront = function(){
		window.open('index.html',"_self");
	}

	thisObj.closeMenu = function(menuObj){
		menuObj.removeClass('active');
	}

	thisObj.closeMenus = function(){
		$('.header-menu .menu-item').removeClass('active');
	}

	//v2.2
	thisObj.getCategories = function(){

		//MAKE API CALL HERE USING "categoryName" VARIABLE TO GET LIST OF ITEMS FOR CATEGORY PAGE.
		//RETURN API DATA TO "populateCategoriesMenu" function below.
		//REMOVE DEBUG LINE OF CODE BELOW
		thisObj.populateCategoriesMenu({});

	}

	//v2.2
	thisObj.populateCategoriesMenu = function(data){

		//LEAVE THIS LINE
		$('.header-menu .menu-item[menu-name="categories"] .item-content .sub-menu').html('');


		//PARSE DATA RETURNED FROM API
		//USE "populateMenuItem" FUNCTION BELOW TO ADD ITEMS TO LIST

		//EXAMPLE START
		//REPLACE THIS EXAMPLE WITH DATA PARSER WITH MULTIPLE "populateCategoryItem" CALLS FOR EACH INDIVIDUAL ITEM
		//populateMenuItem(MENU NAME, ITEM LABEL, ITEM NAME)
		thisObj.populateCategoryMenuItem('categories','MODERN','modern');
		thisObj.populateCategoryMenuItem('categories','LANDSCAPE','landscape');
		//EAMPLE END


		//LEAVE LINE BELOW TO ACTIVATE MENU ITEMS
		thisObj.setCategoryMenuEvents();
	}

	//v2.2
	thisObj.populateCategoryMenuItem = function(menuName,itemLabel,itemName){

		var masterHTML = '<div class="menu-item action-load-category" category-name="'+itemName+'" id="'+itemName+'"><div class="item-label">'+itemLabel+'</div></div>';

		$('.header-menu .menu-item[menu-name="'+menuName+'"] .item-content .sub-menu').append(masterHTML);

		console.log('MENU ADD: ' + $('.header-menu .menu-item[menu-name="'+menuName+'"] .item-content .sub-menu').attr('class'));

	}


	//PAGES

	thisObj.loadPage = function(actionPage,args){
		var pageName = actionPage.attr('page-name');
		var pageArgs = '';
		if(args!=undefined&&args!=null){
			pageArgs = args;
		}
		thisObj.menuId = actionPage.attr('id');
		window.open(pageName+'.html'+pageArgs,"_self");
	}

	//CATEGORIES
	//V2.2
	thisObj.loadCategory = function(actionCategory){
		var categoryName = actionCategory.attr('category-name');
		var pageArgs = '?category='+categoryName;
		window.open('category.html'+pageArgs,"_self");
	}

	//LISTS

	thisObj.loadList = function(actionList,args){
		var listName = actionList.attr('list-name');
		var listArgs = '';
		if(args!=undefined&&args!=null){
			listArgs = args;
		}
		window.open(listName+'.html'+listArgs,"_self");
	}


	//FRONT VIEW SCROLLING

	thisObj.frontLeft = function(){
		//console.log('SCROLL LEFT');
		var scrollLeft = $('.front-header .item-view').scrollLeft();
		var scrollInt = scrollLeft - (thisObj.windowWidth*.75);
		$('.front-header .item-view').stop().animate({scrollLeft:scrollInt}, 900, 'swing', function() {
				});
	}

	thisObj.frontRight = function(){
		//console.log('SCROLL RIGHT');
		var scrollLeft = $('.front-header .item-view').scrollLeft();
		var scrollInt = scrollLeft + (thisObj.windowWidth*.75);
		$('.front-header .item-view').stop().animate({scrollLeft:scrollInt}, 900, 'swing', function() {
				});
	}

	thisObj.frontWheel = function(wheelTarget,event,delta){
		//console.log('FRONT WHEEL: ' + delta)
		var itemView = wheelTarget.find('.item-view')
		itemView.scrollLeft(itemView.scrollLeft()-delta);
	}


	//CATEGORY PAGE
	//v2.2
	thisObj.setCategoryAttrs = function(){

		var bodyCategory = formApp.urlParam('category');

		$('body').attr('category',bodyCategory);
		$('body').attr('name','category-'+bodyCategory);
	}

	thisObj.getCategoryList = function(){

		var categoryName = $('body').attr('category');
		//MAKE API CALL HERE USING "categoryName" VARIABLE TO GET LIST OF ITEMS FOR CATEGORY PAGE.
		//RETURN API DATA TO "populateCategoryList" function below.
		//REMOVE DEBUG LINE OF CODE BELOW
		thisObj.populateCategoryList(categoryName);

	}

	thisObj.populateCategoryList = function(categoryName){
		//alert(categoryName)
		//LEAVE THIS LINE
		$('.category-content .item-view').html('');

		//PARSE DATA RETURNED FROM API
		//USE "populateCategoryItem" FUNCTION BELOW TO ADD ITEMS TO LIST

		//EXAMPLE START
		//REPLACE THIS EXAMPLE WITH DATA PARSER WITH MULTIPLE "populateCategoryItem" CALLS FOR EACH INDIVIDUAL ITEM
		//populateCategoryItem(ITEM TITLE, ITEM ID, ITEM IMAGE URL, AUCTION START, CURRENT BID, TOTAL BIDS)
		/*thisObj.populateCategoryItem('Hendrik Van Cleve III: The Tower of Babel','001','img/item-001.jpg','6/15/2016 12:00pm EST','$67,250','7');
		//EXAMPLE END

		//LEAVE THIS LINE AFTER DATA PARSING CODE HAS CALLED ALL "populateCategoryItem" FUNCTIONS
		thisObj.setCategoryListEvents();*/
		//console.log(">>>>>>>>>>>>>>>>>>>>> populateCategoryList")
		//alert(thisObj.menuId);
		thisObj.getItemsList(categoryName, false);
	}

	thisObj.populateCategoryItem = function(itemTitle,itemID,imgURL,auctionStart,currentBid,totalBids){

		//var masterHTML = '<div class="item" item-id="'+itemID+'"><div class="item-header"><div class="item-image" style="background-image:url('+imgURL+');"></div></div><div class="item-content"><div class="item-details"><div class="item-title item-detail"><div class="detail-label"></div><div class="detail-content">'+itemTitle+'</div></div><div class="item-date item-detail"><div class="detail-label">Auction Start</div><div class="detail-content">'+auctionStart+'</div></div><div class="item-bid item-detail"><div class="detail-label">Current Bid</div><div class="detail-content">'+currentBid+'</div></div><div class="item-bids item-detail"><div class="detail-label">Total Bids</div><div class="detail-content">'+totalBids+'</div></div></div></div><div class="item-footer"><div class="item-actions"><div class="action-button" form-name="item-bid" action-type="form"><div class="button-label">Bid</div></div><div class="action-button" form-name="item-detail" action-type="detail"><div class="button-label">Details</div></div></div></div></div>';
		var masterHTML = '<div class="item" item-id="'+itemID+'"><div class="item-header"><div class="item-image" style="background-image:url('+imgURL+');"></div></div><div class="item-content"><div class="item-details"><div class="item-title item-detail"><div class="detail-label"></div><div class="detail-content">'+itemTitle+'</div></div><div class="item-date item-detail"><div class="detail-label">Auction Start</div><div class="detail-content">'+auctionStart+'</div></div><div class="item-bid item-detail"><div class="detail-label">Current Bid</div><div class="detail-content">'+currentBid+'</div></div><div class="item-bids item-detail"><div class="detail-label">Total Bids</div><div class="detail-content">'+totalBids+'</div></div></div></div><div class="item-footer"><div class="item-actions"><div class="action-button" form-name="item-detail" action-type="detail"><div class="button-label">Details</div></div></div></div></div>';

		$('.category-content .item-view').append(masterHTML);

	}


	//FRONT VIEW

	//V2.2
	thisObj.getFrontList = function(){

		//MAKE API CALL HERE TO GET LIST OF ITEMS FOR FRONT PAGE VIEW.
		//RETURN API DATA TO "populateFrontList" function below.

		//REMOVE DEBUG LINES OF CODE BELOW
		//USE LINE BELOW TO TEST EMPTY RESULT SET
		thisObj.populateFrontList([]);
		//USE LINE BELOW TO TEST FULL RESULT SET
		//thisObj.populateFrontList([{},{}]);
	}

	//V2.2
	thisObj.populateFrontList = function(data){

		//LEAVE THIS LINE
		$('.front-header .item-view').html('');
        thisObj.getItemsList("All", true);

		//ADAM CHANGES
		//CHECK DATASET LENGTH HERE
		/*var dataLength = data.length;
		console.log('FRONT DATA LENGTH: ' + dataLength);

		//IF DATASET IS EMPTY LEAVE SPLASH IMAGE IN PLACE
		if(dataLength==0){
			$('.front-splash').show();
			$('.front-header').hide();
		} else {

			//ELSE ---->

			//LEAVE THESE LINES
			$('.front-header').show();
			$('.front-splash').hide();
			$('.front-header .item-view').html('');

			//PARSE DATA RETURNED FROM API
			//USE "populateFrontItem" FUNCTION BELOW TO ADD ITEMS TO LIST

			//EXAMPLE START
			//REPLACE THIS EXAMPLE WITH DATA PARSER WITH MULTIPLE "populateFrontItem" CALLS FOR EACH INDIVIDUAL ITEM
			//populateFrontItem(ITEM TITLE, ITEM ID, ITEM IMAGE URL)
			thisObj.populateFrontItem('Hendrik Van Cleve III: The Tower of Babel','001','img/item-001.jpg');
			thisObj.populateFrontItem('Antwerp School Circa 1580: The Battle of Algiers','002','img/item-002.jpg');
			thisObj.populateFrontItem('School of Parma Circa 1620: The Holy Family With Saint John the Baptist','003','img/item-003.jpg');
			thisObj.populateFrontItem('Acques Linard: Bowl of Grapes','004','img/item-004.jpg');
			thisObj.populateFrontItem('Jean Restout: Abraham And the Three Angels','005','img/item-005.jpg');
			thisObj.populateFrontItem('Antonio Calza: Cavalry Charge','006','img/item-006.jpg');
			thisObj.populateFrontItem('Jean-Baptiste Martin: The Passage of the Rhine','007','img/item-007.jpg');
			thisObj.populateFrontItem('Pietro Antonio Rotari: Portrait of a Woman In White Clothing','008','img/item-008.jpg');
			//EXAMPLE END


			//LEAVE THIS LINE AFTER DATA PARSING CODE HAS CALLED ALL "populateFrontItem" FUNCTIONS
			thisObj.setFrontListEvents();
		}*/

	}

	thisObj.getItemsList = function(category, isHomePage){

		var args = [];
		var method = "query"
		if (category == 'All') { //Get List of all items
				args.push("2016");
		} else { //Get List by category
			  args.push("2016")
				args.push(category)
		}
		payload = constructPayload(method, "GetItemListByCat", args);
		//payload = constructPayload(method, functionByRecType[recordType], args);
		MainRestCall(payload, method, category, isHomePage);
	}
  //written by Ratnakar
  thisObj.iterateItems = function(data, isHomePage){
		var obj = JSON.parse(data);
		if (Boolean(isHomePage)){
			if (obj.length == 0) {
			//Show splash scren when no data there
			$('.front-splash').show();
			$('.front-header').hide();
		} else {
			//Disable splash screen and show assets
			$('.front-header').show();
			$('.front-splash').hide();
			$('.front-header .item-view').html('');
		}
		}
		for (var i=0;i<obj.length;i++){
		  if (Boolean(isHomePage)){
				thisObj.populateFrontItem(obj[i].ItemDesc,obj[i].ItemID,obj[i].ItemPicFN)
			} else {
				//thisObj.populateCategoryItem('Hendrik Van Cleve III: The Tower of Babel','001','img/item-001.jpg','6/15/2016 12:00pm EST','$67,250','7');
				//TODO: How do we get the Current/Last Bid and Total BID which is again a fresh async call
				//thisObj.populateCategoryItem(obj[i].ItemDesc,obj[i].ItemID,obj[i].ItemPicFN, obj[i].ItemDate, obj[i].ItemBasePrice, '5')
				thisObj.populateCategoryItem(obj[i].ItemDesc,obj[i].ItemID,obj[i].ItemPicFN, obj[i].ItemDetail, obj[i].ItemSubject, obj[i].ItemMedia, obj[i].ItemBasePrice)
			}
		}
		if (Boolean(isHomePage)){
			thisObj.setFrontListEvents();
		} else {
			thisObj.setCategoryListEvents();
		}
	}

		thisObj.populateCategoryItem = function(itemTitle,itemID,imgURL,itemDetail,itemSubject,itemMedia, itemBasePrice){
			//work around to get the image
			imgURL = '../imgs/'+imgURL;
			//var masterHTML = '<div class="item" item-id="'+itemID+'"><div class="item-header"><div class="item-image" style="background-image:url('+imgURL+');"></div></div><div class="item-content"><div class="item-details"><div class="item-title item-detail"><div class="detail-label"></div><div class="detail-content">'+itemTitle+'</div></div><div class="item-date item-detail"><div class="detail-label">Details</div><div class="detail-content">'+itemDetail+'</div></div><div class="item-bid item-detail"><div class="detail-label">Media</div><div class="detail-content">'+itemMedia+'</div></div><div class="item-bids item-detail"><div class="detail-label">Price</div><div class="detail-content">'+itemBasePrice+'</div></div></div></div><div class="item-footer"><div class="item-actions"><div class="action-button" form-name="item-bid" action-type="form"><div class="button-label">Bid</div></div><div class="action-button" form-name="item-detail" action-type="detail"><div class="button-label">Details</div></div></div></div></div>';
      var masterHTML = '<div class="item" item-id="'+itemID+'"><div class="item-header"><div class="item-image" style="background-image:url('+imgURL+');"></div></div><div class="item-content"><div class="item-details"><div class="item-title item-detail"><div class="detail-label"></div><div class="detail-content">'+itemTitle+'</div></div><div class="item-date item-detail"><div class="detail-label">Details</div><div class="detail-content">'+itemDetail+'</div></div><div class="item-bid item-detail"><div class="detail-label">Media</div><div class="detail-content">'+itemMedia+'</div></div><div class="item-bids item-detail"><div class="detail-label">Price</div><div class="detail-content">$'+itemBasePrice+'</div></div></div></div><div class="item-footer"><div class="item-actions"><div class="action-button" form-name="item-detail" action-type="detail"><div class="button-label">Details</div></div></div></div></div>';
			$('.category-content .item-view').append(masterHTML);

		}
	thisObj.populateFrontItem = function(itemTitle,itemID,imgURL){
		//work around to get the image
		imgURL = '../imgs/'+imgURL;
		//var masterHTML = '<div class="item" item-id="'+itemID+'"><div class="item-header"><div class="item-image" style="background-image:url('+imgURL+');"></div></div><div class="item-content"><div class="item-details"><div class="item-title item-detail"><div class="detail-label"></div><div class="detail-content">'+itemTitle+'</div></div></div></div><div class="item-footer"><div class="item-actions"><div class="action-button" form-name="item-bid" action-type="form"><div class="button-label">Bid</div></div><div class="action-button" form-name="item-detail" action-type="detail"><div class="button-label">Details</div></div></div></div></div>';
		var masterHTML = '<div class="item" item-id="'+itemID+'"><div class="item-header"><div class="item-image" style="background-image:url('+imgURL+');"></div></div><div class="item-content"><div class="item-details"><div class="item-title item-detail"><div class="detail-label"></div><div class="detail-content">'+itemTitle+'</div></div></div></div><div class="item-footer"><div class="item-actions"><div class="action-button" form-name="item-detail" action-type="detail"><div class="button-label">Details</div></div></div></div></div>';

		$('.front-header .item-view').append(masterHTML);

	}


}
//TODO:  Redundancy (DRY) with the RestCall, Can we generalize ?
MainRestCall = function (payload, method, category, isHomePage){
	$.ajax({
	    url : mainApp.URL,
	    type: "POST",
	    data : JSON.stringify(payload),
	    success: function(data, textStatus, jqXHR)
	    {

		//data - response from server
		if (data["error"] && data["error"].message) {
			if (method == "query") {
				console.log ("Query is failed !! <br/><b>Error:</b> "+data["error"].message)
			}
			return;
		} else if (data["result"] && data["result"].message){
			var res = data["result"].message
			//We don't deal with Deploy or Invoke
			if (method == "query"){
				mainApp.iterateItems(res, isHomePage);
			} else {
				console.log("Error : Invalid request")
			}
		} else {
			console.log("Error : Check chaincode logs for more details")
		}
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
				console.log("Failure :"+textStatus);
	    }
	});
}
