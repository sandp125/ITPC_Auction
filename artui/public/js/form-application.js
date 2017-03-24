
var path = "https://github.com/ITPeople-Blockchain/auction/art/artchaincode";
var JsonRPC_Version = "2.0";
var InvokeMethod = "invoke";

var recordTypeByFormID = {};
//"USER","ARTINV",  "BID", "AUCREQ", "POSTTRAN", "OPENAUC", "CLAUC"
recordTypeByFormID['user-register'] = 'USER';
recordTypeByFormID['item-register'] = 'ARTINV';
recordTypeByFormID['item-auction'] = 'AUCREQ';
recordTypeByFormID['item-bid'] = 'BID';

var functionByRecType = {};
functionByRecType['USER'] = 'PostUser';
functionByRecType['ARTINV'] = 'PostItem';
functionByRecType['AUCREQ'] = 'PostAuctionRequest';
functionByRecType['BID'] = 'PostBid';
functionByRecType['OPENAUC'] = 'OpenAuctionForBids';
functionByRecType['XFER'] = 'TransferItem';

var methodIdMap = {};
methodIdMap['deploy'] = 1;
methodIdMap['invoke'] = 3;
methodIdMap['query'] = 5;

var auctionID = 0;
var globalXferObj = "";
function formApplication(){

	var thisObj = this;
    thisObj.itemID = '';
	  thisObj.init = function(){
		//console.log('INIT FORM APPLICATION');
		thisObj.setPrimaryEvents();
		thisObj.formLoaded();
		//deployChaincode();
	}

	thisObj.setPrimaryEvents = function(){
		//FORMS
		$('.form-page .form-button').click(function(){
			var actionItem = $(this);
			thisObj.submitForm(actionItem);
		});

	}

	//V2.2
	thisObj.setTransferEvents = function(){
		$('select#transfer_item').change(function(){
			var actionItem = $(this);
			var actionValue = $(this).find('option:selected').attr('name');
			if (!actionValue || actionValue == ''){
				globalXferObj = "";
				//Disable all fields
				$("input").prop('hidden', true);
				$(".item-label.custom-label").prop('hidden', true);
				//Disable Image
				thisObj.populateFormImage('');
				console.log('Oops .. not a right choice ...')
				return;
			}
			console.log('TRANSFER DROPDOWN: ' + actionValue);
			$("input").prop('hidden', false);
			$(".item-label.custom-label").prop('hidden', false);
			//Enable only the new user field
			$("input[id='transfer_user']").prop('disabled', false);
			globalXferObj = actionValue;
			var vals = actionValue.split(" ");
			thisObj.populateFormField('current_user',vals[1])
			thisObj.populateFormField('aes_key_id',vals[2])
			thisObj.selectTransfer(vals[3]);
		});
	}

	//V2.3
	thisObj.setNotificationEvents = function(){

		$('.notification').off('click');
		$('.notification').click(function(){
			var actionItem = $(this);
			actionItem.remove();
		});

	}

	//FORMS

	thisObj.loadForm = function(actionForm,args){
		var formName = actionForm.attr('form-name');
		var formArgs = '';
		if(args!=undefined&&args!=null){
			formArgs = args;
		}
		window.open(formName+'.html'+formArgs,"_self");
	}

	//V2.0
	thisObj.submitForm = function(formButton){
/*
		var actionForm = formButton.parents('.form-container');

		var loadedForm = $('body').attr('name');

		switch (loadedForm){
			case 'item-detail':
				thisObj.submitItemDetail(actionForm);
				break;
			case 'item-register':
				thisObj.submitItemRegister(actionForm);
				break;
			case 'user-register':
				thisObj.submitUserRegister(actionForm);
				break;
			case 'item-auction':
				thisObj.submitItemAuction(actionForm);
				break;
			case 'item-bid':
				thisObj.submitItemBid(actionForm);
				break;
			case 'list-bidding':
				thisObj.submitItemBid(actionForm);
				break;
			case 'list-auctions':
				thisObj.submitOpenAuction(actionForm);
				break;
		}
*/

		if (!formButton) {
			console.log("Invalid formButton Object");
			return;
		}
		var actionForm = formButton.parents('.form-container');
		var functionName = '';
		var recType = '';
		var args = [];
		// this is a special case where we need to Submit selected Item for auction
		if(formButton.children("div")[0] && formButton.children("div")[0].id == 'art_submit_auction' ) {
			recType = 'AUCREQ';
			functionName = functionByRecType[recType];
			var fieldValue = '';
			var ips = $( ":input" );
			//["2000", "Shadows by Asppen", "Painted by famed Mughal era Painter Qasim", "10102015", "Original", "Miniature", "Acrylic", "15” x 20”", "$600", "100"]
			auctionID = getUUID();
			args.push(auctionID); // How do we generate ID ?
			//args.push(recType);
			args.push(ips[0].value);
			args.push('200'); // how do we get AuctionHouse ID
			args.push(ips[7].value);
			args.push(new Date().toString());
			var reservedPrice = ips[9].value;
			if (!reservedPrice || reservedPrice == ''){
				showSuccsessFailureMessage(false, "Reserve Price is missing")
				return;
			}
			if (parseInt(reservedPrice) < parseInt(ips[6].value) ) {
				showSuccsessFailureMessage(false, "Reserve Price is less than Base price")
				return;
			}
			args.push(reservedPrice);
			var buyItNowPrice = ips[10].value;
			if (buyItNowPrice && buyItNowPrice != '') {
				args.push(buyItNowPrice);
			} else if (buyItNowPrice == '' || isNaN(parseInt(buyItNowPrice))){
				args.push("0");
			}

			args.push("INIT");
			args.push(new Date().toString());
			args.push(new Date().toString());
			console.log(args);
		} else if(formButton.children("div")[0] && formButton.children("div")[0].id == 'submit_bid_button' ) {
			var res = (actionForm.find("#form_field_values").val()).split("-")
			recType = 'BID';
			functionName = functionByRecType[recType];
			var fieldValue = '';
			var args = [];
			args.push(res[0])
			args.push(getUUID()) // auctionID+ItemID+buyer ID Generates Bid number
			args.push(res[1]) //bid_price
			var bid_buyer_val = actionForm.find("#bid_buyer").val();
			var bid_price_val = actionForm.find("#bid_price").val();
			if (!bid_buyer_val || bid_buyer_val === ''){
				showSuccsessFailureMessage(false, "Buyer ID is empty")
				return;
			}

			if (!bid_price_val || bid_price_val === ''){
				showSuccsessFailureMessage(false, "Bid Price is empty")
				return;
			}
			if (parseInt(bid_price_val) < parseInt(res[3])){
				showSuccsessFailureMessage(false, "Bid Price is less than Reserve price")
				return;
			}

			args.push(bid_buyer_val) // GET BUYER ID FROM FORM //bid_buyer
			args.push(bid_price_val) //GET THE PRICE //bid_price
		} else if(formButton.children("div")[0] && formButton.children("div")[0].id == 'bid_submit_button'){
			var actionForm = formButton.parents('.form-container');
			recType = recordTypeByFormID[actionForm[0].id];
			functionName = functionByRecType[recType];
			var fieldValue = '';
			var ips = $( ":input" );
			for (var i=0;i<ips.length;i++){
				//console.log('################# '+ips[i].value)
				fieldValue = ips[i].value;

				if (!fieldValue || fieldValue == '') {
					console.log(" ###### Field values shouldn't be empty ###### ")
					showSuccsessFailureMessage(false, ips[i].name+ " value is empty")
					//TODO: Update error message
					return;
				}
				if (i== 0) {
					thisObj.itemID = fieldValue;
				} else if (i == 1){
					args.push(getUUID())
				}
				args.push(fieldValue);
			}
			//return;
		} else if (actionForm.find("#hidden_aucid") && actionForm.find("#hidden_aucid").val()){
			auctionId = actionForm.find("#hidden_aucid").val();
			console.log('AUCTION ID: ' + auctionId);
			recType = 'OPENAUC';
			//OpenAuctionForBids "Args":["1111", "OPENAUC", "1"]}'
			functionName = functionByRecType[recType];
			var args = [];
			args.push(auctionId);
			args.push("OPENAUC");
			var ips = $( ":input" );
			args.push(ips[0].value); //Duration from text field
			var payload = constructPayload("invoke",functionName , args);
			RestCall(payload, "invoke", functionName, auctionId);
			return;
	  } else if (formButton.children("div")[0].id == 'xfer_btn'){
			var fieldValue = '';
			var ips = $( ":input" );
			if (!globalXferObj || globalXferObj == ''){
				showSuccsessFailureMessage(false, "Asset to be transferred not selected")
				return;
			}
			//Get Current user
			var usrID = ips[3].value;
			if (!usrID && usrID == '') {
				showSuccsessFailureMessage(false, ips[3].name+"# is empty")
				return;
			}
			console.log(globalXferObj)
			//["1000", "100", "218MC/ipIsIrDhE9TKXqG2NsWl7KSE59Y3UmwBzSrQo=", "300", "XFER"]}
			var myArgs = []
			var newVals = globalXferObj.split(" ");
			//1000 100 i8NWlV9foHk3Fawiz1eOzjxnqnZBriKDSGCcVrEnJwg= item-008.jpg
			for (var i=0;i<newVals.length-1;i++){ // Ignore last image value
				myArgs.push(newVals[i]);
			}
			//If new user is same as current user prompt an error
			if (usrID == ips[1].value){
				showSuccsessFailureMessage(false, ips[3].name+" is same as "+ips[1].name);
				console.log(ips[3].name+" is same as "+ips[1].name);
				//TODO: if new user doesn't exist throw an error
				return;
			}
			myArgs.push(usrID);
			var myrecType = 'XFER';
			var fnName = functionByRecType[myrecType]
			myArgs.push(myrecType);
			var method = "invoke";
			payload = constructPayload(method, fnName, myArgs);
			makeRestCall(payload, method, myrecType);
			return;
	  } else {
			var actionForm = formButton.parents('.form-container');
			recType = recordTypeByFormID[actionForm[0].id];
			functionName = functionByRecType[recType];
			var fieldValue = '';
			var ips = $( ":input" );
			for (var i=0;i<ips.length;i++){
				fieldValue = ips[i].value;
				if (!fieldValue || fieldValue == '') {
					//TODO: Field level validations are missing
					console.log(" ###### Field values shouldn't be empty ###### ")
					showSuccsessFailureMessage(false, ips[i].name+ " value is empty")
					return;
				}
				args.push(fieldValue);
			}
			// Add recordType as second param in args
		}
		// Add recordType as second param in args
		args.splice(1, 0, recType);
		console.log(args);
		if (recType == "USER") {
			var method = "query";
			payload = constructPayload(method, "GetUser", args);
			makeRestCall(payload, method, recType, args);
			return;
		} else if (recType == "ARTINV") {
			var method = "query";
			payload = constructPayload(method, "GetItem", args);
			//makeRestCall(payload, method, recType, args);
			globalItemData = args;
			$.ajax({
			    url : mainApp.URL,
			    type: "POST",
			    data : JSON.stringify(payload),
			    success: function(data, textStatus, jqXHR)
			    {
						if (data["error"] && data["error"].message && method == "query") {
							console.log ("Query is failed !! <br/><b>Error:</b> "+data["error"].message)
							//Resend the data again
							newPayload = constructPayload("invoke", "PostItem", globalItemData);
							makeRestCall(newPayload, "invoke", "ARTINV");
							return;
						} else if (data["result"] && data["result"].message && recType == 'ARTINV'){
							if (method == "invoke" ) {
								console.log("Inserted new item successfully ...")
								showSuccsessFailureMessage(true);
								$( ":input" ).val('')
							} else if (method == "query") {
								console.log("Record with same Asset ID# already exists")
								showSuccsessFailureMessage(false, "Asset# "+globalItemData[0]+" already exists");
						}
					}
				}
				});
			return;
		}
		payloadHandler(functionName, recType, args);
	}

	var globalItemData;
	//Ratnakar added
	thisObj.notification = function(actionForm,resultType, message){
		$(".form-message."+resultType).text(message)
		actionForm.addClass(resultType);
		var functionDelay = setTimeout(function(){
			$('.form-container').removeClass(resultType);
			$('.form-button').blur();
		},3000);
	}

	//V2.1
	thisObj.submitAltForm = function(formButton){
		var actionForm = formButton.parents('.form-container');

		var loadedForm = $('body').attr('name');

		switch (loadedForm){
			case 'list-bidding':
				thisObj.submitItemBuy(actionForm);
				break;
		}
	}

	thisObj.formResult = function(actionForm,result){
		actionForm.addClass(result);
		var functionDelay = setTimeout(function(){
			$('.form-container').removeClass(result);
			$('.form-button').blur();
		},3000);
	}

	//V2.3
	thisObj.addNotification = function(notificationString){

		var masterHTML = '<div class="notification">'+notificationString+'</div>';
		$('.site-notifications').append(masterHTML);

		thisObj.setNotificationEvents();

	}

	thisObj.submitItemDetail = function(actionForm){

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');
	}

	//V2.3
	thisObj.submitItemRegister = function(actionForm){

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');
	}

	thisObj.submitUserRegister = function(actionForm){

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');
	}

	thisObj.submitItemAuction = function(actionForm){

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');
	}

	thisObj.submitItemBid = function(actionForm){

		console.log('SUBMIT ITEM BID');

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');
	}

	//V2.1
	thisObj.submitItemBuy = function(actionForm){

		console.log('SUBMIT ITEM BUY');
		var res = (actionForm.find("#form_field_values").val()).split("-")
		recType = 'BID';
		var functionName = 'BuyItNow';
		var fieldValue = '';
		var uuid = getUUID();
		var args = [];
		args.push(res[0]);
		args.push(recType);
		args.push(uuid); // auctionID+ItemID+buyer ID Generates Bid number
		args.push(res[1]);

		var bid_buyer_val = actionForm.find("#bid_buyer").val();
		if (!bid_buyer_val || bid_buyer_val === ''){
			console.log('Please provide user ID ');
			// Update failure message
			showSuccsessFailureMessage(false, "Buyer ID# is empty");
			return;
		}
		args.push(bid_buyer_val) // GET BUYER ID FROM FORM //bid_buyer
		var buyItNowPrice = parseInt(res[4]);
		console.log(buyItNowPrice);
		if (!buyItNowPrice || buyItNowPrice === ''){
			console.log('BuyItNow Price is missing ');
			// Update failure message
			showSuccsessFailureMessage(false, "BuyItNow Price is empty");
			return;
		}

		args.push(buyItNowPrice.toString());  //BuyItNow bid_price

		console.log(args);

		//payloadHandler(functionName, recType, args);
		var method = "invoke";
		payload = constructPayload(method, functionName, args);
		makeRestCall(payload, method, recType, args, functionName);
		//TODO : Check whether BID is successful or not (uuid)

	}

	//V2.0
	thisObj.submitOpenAuction = function(actionForm){

		console.log('SUBMIT OPEN AUCTION');

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');

		var auctionID = actionForm.parents('tr.table-detail').prev().attr('auction-id');
		tableApp.finishTableAuction(auctionID);
	}

	thisObj.populateFormField = function(fieldID,fieldData){
		$('#'+fieldID).val(fieldData);
	}
	thisObj.clearFormOptions = function(selectID){
	    $('#'+selectID).html('');
	}

	//V2.2
	thisObj.populateFormOption = function(selectID,optionData,optionName){
		//console.log('POPULATE FORM OPTION');
		//var masterHTML = '<option value="'+optionData+'" name="'+optionName+'">'+optionData+'</option>'
		var masterHTML = '<option value="'+optionData+'" name="'+optionName+'">'+optionData+'</option>'
		$('#'+selectID).append(masterHTML);
	}

	thisObj.populateFormImage = function(imgURL){
		//work around to get the image
		//imgURL = '../art/artchaincode/'+imgURL;
		imgURL = '../imgs/'+imgURL;
		$('.form-image .item-image').css('background-image','url('+imgURL+')')
	}

	thisObj.populateFormIndicator = function(labelVal,contentVal){
		$('.form-indicators').html('');
		var masterHTML = '<div class="indicator-item"><div class="indicator-label">'+labelVal+'</div><div class="indicator-content">'+contentVal+'</div></div>'
		$('.form-indicators').append(masterHTML);
	}

	//API
	thisObj.urlParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		/*if (!results || results.length == 0) {
			return ''
		}*/
		return results[1] || 0;
	}

	//V2.2
	thisObj.formLoaded = function(){
		var loadedForm = $('body').attr('name');

		switch (loadedForm){
			case 'item-detail':
				thisObj.getItemDetail();
				break;
			case 'item-register':
				thisObj.getItemRegister();
				break;
			case 'user-register':
				thisObj.getUserRegister();
				break;
			case 'item-auction':
				thisObj.getItemAuction();
				break;
			case 'item-bid':
				thisObj.getItemBid();
				break;
			case 'item-transfer':
				thisObj.getItemTransfer();
				break;
		}
	}


	thisObj.getItemDetail = function(){
		var formName = $('body').attr('name');
		var itemID = thisObj.urlParam('item-id');
		//console.log('ITEM ID: ' + itemID+'           formName: ' + formName);
		if (!itemID || itemID == ''){
			//Cannot proceedfurther
			return;
		}

		//MAKE API CALL USING "itemID" variable here.
		//RETURN API DATA TO "populateItemDetail" function below.
		thisObj.populateFormField("art_id", itemID);
		getQueryPayload (itemID, "ARTINV", formName)
	}

	thisObj.populateFormField = function(fieldID,fieldData){
		$('#'+fieldID).val(fieldData);

	}

	//V2.0
	thisObj.getItemRegister = function(){

		//MAKE API CALL TO GET USER DROPDOWN OPTIONS
		//RETURN API DATA TO "populateItemRegister" FUNCTION BELOW.
		//REMOVE DEBUG LINE OF CODE BELOW IF USING API CALL
		//LEAVE LINE OF CODE BELOW IF MANUALLY POPULATING OPTIONS USING "populateItemRegister"
		thisObj.populateItemRegister({});

	}

	//V2.0
	thisObj.getUserRegister = function(){

		//MAKE API CALL TO GET DROPDOWN OPTIONS
		//RETURN API DATA TO "populateUserRegister" FUNCTION BELOW.
		//REMOVE DEBUG LINE OF CODE BELOW IF USING API CALL
		//LEAVE LINE OF CODE BELOW IF MANUALLY POPULATING OPTIONS USING "populateUserRegister"
		thisObj.populateUserRegister();

	}

	thisObj.getItemAuction = function(){

	}

	thisObj.getItemBid = function(){

		var formName = $('body').attr('name');
		var itemID = thisObj.urlParam('item-id');

		//MAKE API CALL USING "itemID" variable here.
		//RETURN API DATA TO "populateItemDetail" function below.
		thisObj.populateFormField("bid_art_id", itemID);

		//LEAVE THE CODE BELOW TO GET CURRENT BIDS
		//ADJUST THE INTERVAL TO UPDATE THE CURRENT BIDS BELOW
		//CURRENTLY SET TO 5 SECONDS
		var bidInterval = 5000;
		var updateBids = setInterval(function(){
			//console.log(thisObj.itemID)

			//Call this from REST call
			thisObj.getCurrentBids();
		},bidInterval);

	}

	//V2.2
	thisObj.getItemTransfer = function(){

		//MAKE API CALL TO GET ASSETS AVAILABLE FOR TRANSFER
		//RETURN API DATA TO "populateItemTransfer" FUNCTION BELOW.
		//REMOVE DEBUG LINE OF CODE BELOW IF USING API CALL
		//LEAVE LINE OF CODE BELOW IF MANUALLY POPULATING OPTIONS USING "populateItemTransfer"\

		//TODO: Query to get list of Items, once items received call populateItemTransfer
		var args = [];
		args.push("2016")
		var method = "query"
		payload = constructPayload(method, "GetItemListByCat", args);
		makeRestCall(payload, method, 'GETASSETS');
	}

	thisObj.getCurrentBids = function(){

		var itemID = thisObj.urlParam('item-id');
		//console.log('ITEM ID: ' + itemID);

		//MAKE API CALL USING "itemID" variable here.
		//RETURN API DATA TO "populateCurrentBids" function below.
		//REMOVE DEBUG LINE OF CODE BELOW
		thisObj.populateCurrentBids({});

	}

	thisObj.populateItemDetail = function(data){
		var obj = JSON.parse(data);
		//USE "populateFormField" function above to add data to DOM

		thisObj.populateFormField('art_description', obj['ItemDesc']);
		thisObj.populateFormField('art_artist', obj['ItemDetail']);
		thisObj.populateFormField('art_date', obj['ItemDate']);
		thisObj.populateFormField('art_type', obj['ItemType']);
		thisObj.populateFormField('art_subject', obj['ItemSubject']);
		thisObj.populateFormField('art_media', obj['ItemMedia']);
		//thisObj.populateFormField('art_size', obj['ItemSize']);
		thisObj.populateFormField('art_price', obj['ItemBasePrice']);
		thisObj.populateFormField('art_owner', obj['CurrentOwnerID']);
		thisObj.populateFormField('aes_key', obj['AES_Key']);
		var imgurl = '../imgs/'+obj['ItemPicFN'];
		//alert(imgurl);
		$('#art_image').css('background-image', 'url(' + imgurl+ ')');

		// How do you decide this item is associated with which Auction ?
		//peer chaincode query -l golang -n mycc -c '{"Function": "GetListOfInitAucs", "Args": ["2016"]}'
		var method = "query";
		//var payload = constructPayload(method, "GetListOfInitAucs", ["2016"]);
        var args = [];
		args.push(obj['ItemID'])
		args.push("VERIFY")
		var payload = constructPayload(method, "IsItemOnAuction", args);
		makeRestCall(payload, method, args[1]);
	}

	//V2.0
	thisObj.populateItemRegister = function(data){

		//PARSE DATA RETURNED FROM API
		//USE "populateFormField" and/or "populateFormOption" function above to add data to DOM
		thisObj.clearFormOptions('art_image');
		thisObj.clearFormOptions('art_owner');
		thisObj.clearFormOptions('art_description');
		thisObj.clearFormOptions('art_size');

		thisObj.populateFormOption('art_image','Original');
		thisObj.populateFormOption('art_image','Reprint');
		thisObj.populateFormOption('art_owner','landscape');
		thisObj.populateFormOption('art_owner','modern');
		thisObj.populateFormOption('art_description','Acrylic');
		thisObj.populateFormOption('art_description','Canvas');
		thisObj.populateFormOption('art_description','Water Color');
		//TODO: Its not the right way ...
		for (var i=1;i<=8;i++){
			thisObj.populateFormOption('art_size','item-00'+i+'.jpg');
		}
		for (var i=1;i<8;i++){
			thisObj.populateFormOption('art_size','art'+i+'.png');
		}

		thisObj.populateFormOption('art_size','mad-fb.jpg');
		thisObj.populateFormOption('art_size','people.gif');
		thisObj.populateFormOption('art_size','sample.png');

	}

	//V2.0
	thisObj.populateUserRegister = function(data){

		//PARSE DATA RETURNED FROM API
		//USE "populateFormField" and/or "populateFormOption" function above to add data to DOM
		thisObj.clearFormOptions('user_type');
	  // Auction House (AH), Bank (BK), Buyer or Seller (TR), Shipper (SH), Appraiser (AP)
		thisObj.populateFormOption('user_type','Buyer/Seller');
		thisObj.populateFormOption('user_type','Auction House');
		thisObj.populateFormOption('user_type','Shipper');
		thisObj.populateFormOption('user_type','Bank');
		thisObj.populateFormOption('user_type','Appraiser');
	}

	thisObj.populateItemAuction = function(data){

	}

	//V2.2
	thisObj.populateItemTransfer = function(data){
		//TODO: Get Asset number, Image and save them here and use the same while making a rest call
		thisObj.populateFormOption('transfer_item','Select','');
		for (var i=0;i<data.length;i++){
     // ["1000", "100", "tGEBaZuKUBmwTjzNEyd+nr/fPUASuVJAZ1u7gha5fJg=", "300", "XFER"]}'
			// Club all required strings with space delimiter
			var optionName = data[i].ItemID+" "+data[i].CurrentOwnerID+" "+data[i].AES_Key+" "+data[i].ItemPicFN;
			thisObj.populateFormOption('transfer_item',data[i].ItemID,optionName);
			/*thisObj.populateFormOption = function(selectID,optionData,optionName){
				console.log('POPULATE FORM OPTION');
				var masterHTML = '<option value="'+optionData+'" name="'+optionName+'">'+optionData+'</option>'
				$('#'+selectID).append(masterHTML);
			}*/
		}
		//PARSE DATA RETURNED FROM API
		//USE "populateFormField" and/or "populateFormOption" function above to add data to DOM

		//EXAMPLE START
		//REPLACE THIS EXAMPLE WITH DATA PARSER WITH MULTIPLE "populateFormOption" CALLS FOR EACH INDIVIDUAL FIELD
		//populateFormOption(SELECT TAG ID, LABEL FOR DROPDOWN OPTION, ID STORED IN "name" ATTR)
		/*thisObj.populateFormOption('transfer_item','Item to Transfer 1','001');
		thisObj.populateFormOption('transfer_item','Item to Transfer 2','002');
		thisObj.populateFormOption('transfer_item','Item to Transfer 3','003');*/
		//EXAMPLE END

		//LEAVE LINE BELOW TO ACTIVATE EVENTS FOR DROPDOWN LIST
		thisObj.setTransferEvents();

	}

	//V2.2
	thisObj.selectTransfer = function(imageName){

		//USE ITEM ID TO GET IMAGE URL FROM API
		//CALL "populateFormImage" TO ADD IMAGE TO DOM AFTER RETRIEVING URL
		thisObj.populateFormImage('/'+imageName);

	}

	thisObj.populateItemBid = function(data){
		var obj = JSON.parse(data);
		for (prop in obj) {
			console.log(obj[prop])
		}

		//PARSE DATA RETURNED FROM API
		//USE "populateFormField" function above to add data to DOM

		//EXAMPLE START
		//REPLACE THIS EXAMPLE WITH DATA PARSER WITH MULTIPLE "populateFormField" CALLS FOR EACH INDIVIDUAL FIELD
		//populateFormField(FIELD ID, FIELD CONTENT)
		//thisObj.populateFormField('bid_auction_id','1111');
		//thisObj.populateFormField('bid_art_id','1000');

		//EXAMPLE END

	}

	//V2.1
	thisObj.populateCurrentBids = function(data){

		console.log('UPDATED CURRENT BIDS');

		//LEAVE THIS LINE OF CODE TO CLEAR SPECS BEFORE POPULATING NEW
		$('.form-spec').html('');

		//PARSE DATA RETURNED FROM API
		//USE "populateFormSpec" function above to add data to DOM

		//EXAMPLE START
		//REPLACE THIS EXAMPLE WITH DATA PARSER WITH MULTIPLE "populateFormSpec" CALLS FOR EACH INDIVIDUAL FIELD
		//populateFormField(SPEC LABEL, SPEC CONTENT, SPEC POSITION)
		thisObj.populateFormSpec('Highest Bid','$67,890','left');
		thisObj.populateFormSpec('Last Bid','$67,890','right');
		//EXAMPLE END

	}
	//TODO: Combine the below two functions
	thisObj.populateHeighestBid = function(data){
		var obj = JSON.parse(data)
		thisObj.populateFormSpec('Highest Bid :', obj.BidPrice, 'left');
		//thisObj.populateFormSpec('Last Bid :', obj.BidPrice, 'right');
	}

	//V2.0
	thisObj.hideButton = function(){
		$('.form-button').hide();
	}


	thisObj.populateLastBid = function(data){
		var obj = JSON.parse(data)

		//thisObj.populateFormSpec('Last Bid :', obj.BidPrice);
	}

	//V2.1
	thisObj.populateFormSpec = function(labelVal,contentVal,specPosition){
		$('.form-spec.'+specPosition).html('');
		var masterHTML = '<div class="spec-item"><div class="spec-label">'+labelVal+'</div><div class="spec-content">'+contentVal+'</div></div>'
		$('.form-spec.'+specPosition).append(masterHTML);
	}
}

getQueryPayload = function (key, recType) {
	if (!localStorage.getItem("chaincodeHash") || localStorage.getItem("chaincodeHash") === '') {
	//if (!thisObj.chaincodeHash && thisObj.chaincodeHash === '') {
		return;
	}
	var method = "query";
	var args = [key];
	payload = constructPayload(method, "GetItem", args);
	makeRestCall(payload, method, recType);
}

payloadHandler = function(functionName, recordType, args ){
	// TODO: determine query or invoke based on button type
	var method = "invoke";
	payload = constructPayload(method, functionName, args);
	makeRestCall(payload, method, recordType);
}

/**
 * Construct Payload before making a Restcall
 */
function constructPayload(methodName, functionName, args){
	console.log("========= In constructPayload ========= ");
	//Construct Payload
	var payload = {
	  "jsonrpc": JsonRPC_Version,
	  "method": methodName,
	}
	var isInit = getPayloadID(methodName) == 1;
	payload.params = {}
	payload.params.type = 1
	if (Boolean(isInit)) {
		payload.params.chaincodeID = {
			"path": path,
			//Don't use mycc as chaincode for net mode
			//"name": "mycc" //localStorage.getItem("chaincodeHash")
		}
	} else {
		payload.params.chaincodeID = {
			// "name" : "mycc" //Use this for DEV mode
			"name": localStorage.getItem("chaincodeHash")
		}
	}

	payload.params.ctorMsg = {
		"function" : functionName,
	  	"args": args,
	}
	//Get this from Nodejs
	payload.params.secureContext = mainApp.userID;//"dashboarduser_type0_f4df8e532c";
	// get the payload ID based on method name
	payload.id = getPayloadID(methodName);
	console.log(payload);
	return payload;
}
var globalData;
//Make a rest call and parse the result based on Record Types {"USER" , "ARTINV", "AUCREQ", "POSTTRAN"}
function makeRestCall(payload, method, recordType, argsData, funcName){
	if (argsData != undefined) {
		globalData = argsData;
	}
	console.log(JSON.stringify(payload));
	$.ajax({
	    url : mainApp.URL,
	    type: "POST",
	    data : JSON.stringify(payload),
	    success: function(data, textStatus, jqXHR)
	    {
		//TODO: How to handle the limitation in chaincode REST response when container creation failed ?
		if (method == "deploy") {
			//TODO: Current limitation in chaincode is that REST response is independent of container creation
			/*setTimeout(function() {
				$.unblockUI();
			}, DEPLOY_DELAY); // how do we deal container creation, if to remove delay ?*/
		}
		//data - response from server
		if (data["error"] && data["error"].message) {
			if (method == "query") {
				console.log ("Query is failed !! <br/><b>Error:</b> "+data["error"].message)
				//Resend the data again
				newPayload = constructPayload("invoke", "PostUser", globalData);
				makeRestCall(newPayload, "invoke", "USER");
				return;
			} else if (method == "invoke") {
				console.log('################### is Invoke failed ? Err : '+data["error"].message);
				showSuccsessFailureMessage(false);
			}
			return;
		} else if (data["result"] && data["result"].message){
			var res = data["result"].message
			console.log("Results is "+res);
			if (method == "deploy") {
				// Store chaincode which is required for subsequent Invokes/Queries
				formApp.chaincodeHash = res;
				var closeAuctionsTimer = setInterval(function(){
					tableApp.CloseAuctionsPoll();
				}, 10000);
			} else if (method == "invoke") {
				console.log("################# Invoke Successful");
				if (recordType == 'BID'){
					console.log("Bid placed successfully !!")

					if (funcName == 'BuyItNow') {
						showSuccsessFailureMessage(true, "BuyItNow submitted successfully ");
						/*var method = "query";
						var newArgs = [argsData[0]]
						payload = constructPayload(method, "GetAuctionRequest", newArgs);
						makeRestCall(payload, method, "AUCREQ");*/
						checkIfAuctionClosed(argsData[0])
						//return;
					}
					//clear form on success
					//$( ":input" ).val('')
				}

				if (recordType == 'ARTINV'){
					console.log("Inserted new item successfully ...")
					var ips = $( ":input" );
					checkForNotification(ips[0].value)
					$( ":input" ).val('')

				}
				showSuccsessFailureMessage(true);
				if (recordType == 'AUCREQ'){
					formApp.populateFormIndicator("Auction ID", auctionID)
					togglePutonAuctionButton('true');
				}
				if (recordType == 'USER') {
					showSuccsessFailureMessage(true);
					$( ":input" ).val('')
				}

				/*if (recordType === 'OPENAUC'){
					tableApp.finishTableAuction(auctionID);
				}*/

			} else if (method == "query"){
				console.log("################# Query is Successful !!");
				if (recordType == 'ARTINV') {
					//pass the result 'res'
					formApp.populateItemDetail(res);
				} else if (recordType === 'VERIFY') {
					togglePutonAuctionButton(res);
				} else if (recordType == 'USER') {
					console.log("Record with same UserID# already exists")
					//TODO: Should we clear User ID field ?
					showSuccsessFailureMessage(false, "User "+globalData[0]+" already exists");
				} else if (recordType == 'AUCREQ'){

						if (res.indexOf('CLOSED') > 0) {
							console.log('AUCTION '+argsData[0]+' is closed')
							tableApp.closedByBuyItPrice[argsData[0]] = true;
							console.log(tableApp.closedByBuyItPrice[argsData[0]])
						} else {
							console.log('Oops ... AUCTION is not closed yet ...')
						}
				} else if (recordType == 'NOTIF'){
					var obj = JSON.parse(res);
					//Display notification.
					formApp.addNotification('Asset # '+obj.ItemID+' registered successfully to user'+obj.CurrentOwnerID+', with registration key  :  <b>'+obj.AES_Key+'</b>');
				} else if (recordType == 'GETASSETS'){
					var obj = JSON.parse(res);
					formApp.populateItemTransfer(obj);
				}
				/*else if (recordType == 'BID') {
					formApp.populateItemBid(res);
				}*/
			} else {
			 console.log("Error : Invalid request")
		 }
		} /*else {
			console.log("Error : Check chaincode logs for more details")
			//showSuccsessFailureMessage(false);
		}*/
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
				if (recordType === 'BID') {
					//USE THIS FUCNTION IF ERROR
					//TODO: How to get actionForm here ?
					//formApp.formResult(actionForm,'error');
				}
				//showSuccsessFailureMessage(false);
				console.log("Failure :"+textStatus);
	    }
	});
}

checkForNotification = function (itemId) {
	var args = [];
	args.push(itemId);
	// This is hack as we don't get the response from REST API on invokes
 setTimeout(function(){
	 var method = 'query'
	 var payload = constructPayload(method, "GetItem", args);
	 makeRestCall(payload, method, "NOTIF");
 },2000);
}

checkIfAuctionClosed = function(auctionID) {
	 // This is hack as we don't get the response from REST API on invokes
	setTimeout(function(){
		var method = "query";
		var newArgs = [auctionID]
		payload = constructPayload(method, "GetAuctionRequest", newArgs);
		makeRestCall(payload, method, "AUCREQ", newArgs);
	},2000);
}

togglePutonAuctionButton = function(isItemOnAuc) {
	if (isItemOnAuc === 'true') {
		console.log("Item is already placed on auction, Disable button...");
		formApp.hideButton();
	} else {
		console.log("Item is not yet available on auction");
	}
}

showSuccsessFailureMessage = function(isSuccess, message){
	var cssClass = ''
	if (Boolean(isSuccess)) {
		cssClass = 'success';
	} else {
		cssClass = 'error';
	}
	if (message && message != ''){
		$(".form-message."+cssClass).text(message)
	}
	$('.form-button').parents('.form-container').addClass(cssClass);
	var functionDelay = setTimeout(function(){
			$('.form-container').removeClass(cssClass);
			$('.form-button').blur();
		},3000);
}

deployChaincode = function() {
	var method = "deploy";
	var functionName = "init";
	var args = ["INITIALIZE"];
	payload = constructPayload(method, functionName, args);
	console.log("##################### deploychaincode");
	makeRestCall(payload, method, "");
}

getPayloadID = function(methodName) {
	var id = methodIdMap[methodName];
	return id;
}

getUUID = function() {
    var a = Math.floor((Math.random() * 9) + 1);
    var b = Math.floor((Math.random() * 9) + 1);
    var c = Math.floor((Math.random() * 9) + 1);
    var d = Math.floor((Math.random() * 9) + 1);
    return a+''+b+''+c+''+d;
}
