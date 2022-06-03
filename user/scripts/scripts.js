(function () {
  /* globals $ */
  var scriptSrc = document.currentScript.src;
  var re = /([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})/i;
  var packageId = re.exec(scriptSrc.toLowerCase())[1];
  var packagePath = scriptSrc.replace("/scripts/scripts.js", "").trim();
  var customFieldPrefix = packageId.replace(/-/g, "");
  const HOST = window.location.host;
  var hostname = window.location.hostname;
  var urls = window.location.href.toLowerCase();
  var userId = $("#userGuid").val();
  var accessToken = 'Bearer ' + getCookie('webapitoken');
  const baseURL = window.location.hostname;
  const protocol = window.location.protocol;


  function waitForElement(elementPath, callBack) {
    window.setTimeout(function () {
      if ($(elementPath).length) {
        callBack(elementPath, $(elementPath));
      } else {
        waitForElement(elementPath, callBack);
      }
    }, 500);
  }
  function getCookie (name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }



  
  //get mp, user custom fields

 var getCustomFields  = (function (){
    var instance;
    function init()
    {
     
      async function getMarketplaceCustomFields(callback) {
        var apiUrl = "/api/v2/marketplaces";
        $.ajax({
          url: apiUrl,
          method: "GET",
          contentType: "application/json",      
          success: function (result) {
            if (result) {
              callback(result.CustomFields);
            }
          },
        });
      }

      async function getUserCustomFields(callback)
      {
         var apiUrl = `/api/v2/users/${userId}/`;
        $.ajax({
          url: apiUrl,
          method: "GET",
          contentType: "application/json",
           headers: {
            "Authorization": "Bearer " + accessToken
          },

          success: function (result) {
            if (result) {
              callback(result.CustomFields);
            }
          },
        });
      }


      function getMerchantDetails(callback)
      {
        var merchantGuid = localStorage.getItem('merchant_id');
        var apiUrl = `/api/v2/users/${merchantGuid}`;
        $.ajax({
          url: apiUrl,
          method: "GET",
          contentType: "application/json",
          success: function (result) {
            if (result) {
              callback(result);
            // console.log(`custom  ${result.CustomFields}`);
            } else {
              callback();
            // console.log(`custom  ${result.CustomFields}`);
            }
          },
        });
    }
      return {
        getMarketplaceCustomFields: getMarketplaceCustomFields,
        getUserCustomFields: getUserCustomFields,
        getMerchantDetails : getMerchantDetails
        
      }
  }
    return {
      getInstance: function ()
      {
        if (!instance) {
        
            instance = init()
        
        }
        
        return instance
      }
    }

 })()


var userInvite = (function (){
    var instance;
    function init(){
      function appendInvite()
      {
        
        let inviteButton =  `<li class=""><a class="btn btn-invite-consumer" href="javascript:void(0);" data-toggle="modal" data-target="#modal-invite-consumer">+ Invite Consumer</a></li>`
        $('.navigation').prepend(inviteButton);
        let inviteModal = `<div id="modal-invite-consumer" class="modal fade x-boot-modal" role="dialog" style="display: block;">
                            <div class="modal-dialog">
                                
                                    <!-- Modal content-->
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <button type="button" class="close" data-dismiss="modal">×</button>
                                            <h4 class="modal-title" align="center">Invite your Consumer to onboard on your marketplace</h4>
                                            <p class="text-center">Enter your recipient emails below <br>(Use commas seprate muktiple recipients).</p>
                                        </div>
                                        <div class="modal-body">
                                          <div class="row">
                                            <div class="col-md-12">
                                                <textarea name="invite_mail" rows="5" class="form-control light required invite-buyers-email-list " placeholder="e.g: seller1@email.com, seller2@gmail.com"></textarea>
                                            </div>  
                                          </div>                   
                                        </div>
                                        <div class="modal-footer text-center">
                                            <button class="btn-red" id="invite">Send</button>
                                        </div>
                                    </div>
                               
                            </div>
                        </div>`;
        
        $('body').append(inviteModal);

      }

      function sendEmail(emails){
        var data = { 'emails' : emails.split(',') };
        console.log(data);
        var apiUrl = packagePath + '/send_edm.php';
        $.ajax({ 
          url: apiUrl,
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: function (response)
          {

            $('#modal-invite-consumer').removeClass('in');
             jQuery("#cover").hide();
             jQuery('body').removeClass('modal-open');


            //  toastr.success('Successfully saved.');

          },
          error: function (jqXHR, status, err)
          {
            // toastr.error('---');
          }
      });
      }

      function processInvite()
      {
        //check if the url is from an invite
        var isInvited = getParameterByName('isInvited') == 'true' ? true : false;   

        if (isInvited) {
          //save the merchant id to local storage for later use
          merchantId = getParameterByName('merchant_guid');
          localStorage.setItem('merchant_id', merchantId);
          // default the sign in tab for sign up
          $('.signin-sec').removeClass('active');
          $('.register-sec').addClass('active');
         
        }


      }

    
     
      return {
        
        appendInvite: appendInvite,
        sendEmail: sendEmail,
        processInvite : processInvite
      }
  }
    return {
      getInstance: function ()
      {
        if (!instance) {
        
            instance = init()
        
        }
        
        return instance
      }
    }

 })()

  
var merchantReview = (function (){
    var instance;
    function init()
    {
     
      function appendReviewModal(name)
      {
        //append the modal to the body of home page
        $('head').append(`<script type="text/javascript" src="https://bootstrap.arcadier.com/spacetime/js/rating.js"></script>`);
        let reviewModal = `<div class="popup-area popup-merchant-rating">
                          <div class="wrapper">
                            <div class="title-area">
                                <div class="pull-left"><strong>Please rate ${name} and write a review</strong></div>
                              <div class="pull-right"> <a href="javascript:void(0);" onclick="closePopup('popup-merchant-rating')"><img src="https://bootstrap.arcadier.com/package/images/icon-cross-black.png" /></a> </div>
                              <div class="clearfix"></div>
                            </div>
                            <div class="content-area">
                                <div class="form-group">
                                    <label for="your-name">Your Name</label>
                                    <input type="text" name="headline" id="your-name" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="headline">Overall Ratings</label>
                                    <input type="hidden" value="" name="rating_val" id="rating">
                                    <div id="stars" class="starrr"></div>
                                    <div class='starrrs' id="star2"></div>
                                </div>
                                  <div class="form-group">
                                    <label for="headline">Headline</label>
                                    <input type="text" name="headline" id="headline" class="form-control">
                                  </div>
                                  <div class="form-group">
                                    <label for="review">Review</label>
                                    <textarea name="review" id="review" class="form-control" ></textarea>
                                  </div>
                            </div>
                            <div class="btn-area text-center"> <a href="javascript:void(0);" class="feedback-popup-submitbtn" onclick="">SUBMIT</a>
                              <div class="clearfix"></div>
                            </div>
                            </div>
                          </div>
                          <!--modal register-->
                          <div id="cover"></div>
                          <div class="modal-overlay"></div>`;
        $('body').append(reviewModal);
       

      }
      
    function giveItemFeedback(){
      var target =  jQuery(".popup-area.popup-merchant-rating");
      var cover = jQuery("#cover");
      target.fadeIn();
      cover.fadeIn();	
      jQuery('body').addClass('modal-open');
      
      jQuery('#stars').on('starrr:change', function(e, value){
      jQuery('input[name=rating_val]').val(value);
      });
    }
      
    function getRating(rating) {
		var quote = '';
		
		switch(rating) {
			case 1 :
				quote = 'Unsatisfied.';
			break;
			
			case 2 :
				quote = 'Okay.';
			break;
			
			case 3 :
				quote = 'Good.';
			break;
			
			case 4 :
				quote = 'Great!';
			break;
				
			case 5 :
				quote = 'Excellent!!';
			break;
		}
		return quote;
    }
      
    function submitFeedback(){
        jQuery(".popup-area.popup-merchant-rating").hide();
        jQuery("#cover").hide();
        jQuery('body').removeClass('modal-open');

      saveFeedback($('#rating').val(), $('#headline').val(), $('#review').val(), $('#your-name').val(),localStorage.getItem('merchant_id'));

    }
      
    function closePopup(closePopup){
      jQuery("."+closePopup).hide();
      jQuery("#cover").hide();
      jQuery('body').removeClass('modal-open');
    }
      
    function saveFeedback(rating, headline, review, name, merchant_guid)
    {
       var data = { 'consumer_id': userId, 'consumer_name': name, 'merchant_id': merchant_guid, rating, headline, review }
          console.log({data})
          $.ajax({
              method: "POST",
              url: `${protocol}//${baseURL}/api/v2/plugins/${packageId}/custom-tables/merchant_reviews/rows`,
              headers: {
                  "Content-Type": "application/json"
              },
              
              data: JSON.stringify(data),
              //  })
              success: function (response)
              {
                  console.log({ response })
                sendEmailToMerchant(localStorage.getItem('merchant_id'));

              
              }    
        })
    }
      
    function sendEmailToMerchant(merchant_guid)
    {
        var data = { merchant_guid };
          console.log(data);
          var apiUrl = packagePath + '/send_review.php';
          $.ajax({ 
            url: apiUrl,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response)
            {

              console.log(response);

              //delete the merchant_id localstorage once email has been sent

              localStorage.removeItem('merchant_id');

              //  toastr.success('Successfully saved.');

            },
            error: function (jqXHR, status, err)
            {
              // toastr.error('---');
            }
        });
    }
 
  return {
    appendReviewModal: appendReviewModal,
    giveItemFeedback: giveItemFeedback,
    getRating: getRating,
    submitFeedback: submitFeedback,
    closePopup: closePopup,
    saveFeedback: saveFeedback
    
  }
  }
  return {
    getInstance: function ()
    {
      if (!instance) {
      
          instance = init()
      
      }
      
      return instance
    }
  }

})()

  

  $(document).ready(function () {
  
    
    if (document.body.className.includes('page-home')) {


      //validate if the user already submitted a review
      var userData = getCustomFields.getInstance();
      var reviewAction = merchantReview.getInstance();
      
      userData.getUserCustomFields(function (result)
      {
        console.info({ result });
        if (result) {
            result.some(item => item.Name === 'reviewed') ? console.info('saved already') : userData.getMerchantDetails(function (result)
            {
              let merchantName = result.DisplayName;
              reviewAction.appendReviewModal(merchantName);
             
            }) 
            //show modal if not yet reviewed.
          setTimeout(function ()
          {
              
             reviewAction.giveItemFeedback();
             
              // $('.starrr').starrr()
            
            },1000);
          
        } else {
          console.info('none');
           userData.getMerchantDetails(function (result)
            {
              let merchantName = result.DisplayName;
              reviewAction.appendReviewModal(merchantName);
             
            }) 
           setTimeout(function() {
            userData.getMerchantDetails(function (result)
            {
              let merchantName = result.DisplayName;
              reviewAction.giveItemFeedback(merchantName);
            })
            //   $('.starrrs').starrr({
            //   rating: 4
            // })
            
            },1000);
          
        }
           

      });
      //review

      jQuery('body').on('mouseout','#stars .glyphicon',function(){
      var $this = jQuery(this);
      var rating = parseInt($this.parent('.starrr').find('.glyphicon-star').length);

      if(!rating)
              $this.parent('.starrr').next('.quote').remove();

      if( jQuery('input[name=rating_val]').val() )
              $this.parent('.starrr').next('.quote').text( reviewAction.getRating(rating) );
      });

      jQuery('body').on('mouseenter','#stars .glyphicon',function(){
          var $this = jQuery(this);
          var rating = parseInt($this.parent('.starrr').find('.glyphicon-star').length);
          var quote = reviewAction.getRating(rating)
          var ob_quote = '<span class="quote">'+quote+'</span>';
          $this.parent('.starrr').next('.quote').remove();
          $this.parent('.starrr').after(ob_quote);
      });
      
      jQuery('body').on('click', '.feedback-popup-submitbtn', function ()
      {
        reviewAction.submitFeedback();
      })
      
    }

    if (document.body.className.includes('page-dashboard')) {
      var inviteData = userInvite.getInstance();
      inviteData.appendInvite();

      $('body').on('click', '#invite', function (){

      inviteData.sendEmail($('.invite-buyers-email-list').val())

      });

    }

    if (document.body.className.includes('page-login')) {
      var inviteData = userInvite.getInstance();
      inviteData.processInvite();

    }

  

  
  });
})();
