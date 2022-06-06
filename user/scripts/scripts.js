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
  var countryCode, stateCode, cityCode;



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
      
      function getConsumerDetails(consumerId, callback)
      {
        var apiUrl = `/api/v2/users/${consumerId}`;
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
        getMerchantDetails: getMerchantDetails,
        getConsumerDetails : getConsumerDetails
        
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
      
    function sendEmailToMerchant(merchant_guid) {
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
    
      function getMerchantReviews(merchant_guid)
      {
    
      var data = [{ 'Name': 'merchant_id', 'Operator': "equal", "Value": merchant_guid }]
            
            $.ajax({
              method: "POST",
              url: `${protocol}//${baseURL}/api/v2/plugins/${packageId}/custom-tables/merchant_reviews/`,
              headers: {
                "Content-Type": "application/json"
              },
            
              data: JSON.stringify(data),
         
              success: function (response)
              {
                console.table({ response })
                const reviews = response.Records;
                const totalReviews = response.TotalRecords;
                // add the existing review from the item reviews


                 reviews.forEach(function (review, i){

                   let consumerId = review.consumer_id;
                   let rating = review.rating;
                   let headline = review.headline;
                   let reviewText = review.review;

                   var userData = getCustomFields.getInstance();
                    userData.getConsumerDetails(consumerId,function (result){
                      let consumerName = result.DisplayName;
                      let consumerImage = result['Media'].length ? result['Media'][0]['MediaUrl']: '';
                     

                      appendReviews(consumerName, consumerImage, headline, reviewText, rating, review.Id);

                    })


                    
                    
                })
                

            
              }
            })
      
      }
      
    function appendReviews(consumer_name, image, headline, review, rating, id)
    {
      // const reviewDiv = `<div class="cart-item-row" data-key="item" data-id="147989" id=${id}>   
      // <div class="cart-item-box-left">      
      // <div class="cart-item-img"> 
      // <img src="https://26thofmay.test.arcadier.io/images/items/item-170586-637892220599169685-j5kcam.jpg"> 
      // </div>   </div>   <div class="cart-item-box-desc">     
      //  <div>         
      //  <div class="col-md-7" data-item-guid="e49f534a-e739-43eb-b584-b5d8cd8b9480" data-item-id="959064">            
      //  <h3><a href="/User/Item/Detail/Full-house-electrical-setup/959064">${headline}</a></h3>         
      //  </div>         <div class="col-md-5">            <div class="storefront-date">27/05/22, 12:30</div>         
      //  </div>         <div class="clearfix"></div>      </div>      <div class="storefront-desc">        
      //   <div class="cart-top-sec-left">
      //   <img src="${image}" align="absmiddle" width="40">
      //   <span class="cart-publish-merchant">${consumer_name}</span></div>
      //      <div class="cart-top-sec-left">
      //     <div class="store-rating"></div>         
      //     </div>
      // <div class="clearfix"></div>      </div><!-- End of <div class="storefront-desc"> -->
      //   <div class="cart-item-desc">${review}</div></div></div>`
      



      const reviewDiv = `<div class="cart-item-row" data-key="item" data-id="1" id=${id}>

                    <div class="cart-item-box-desc cart-item-box-left-remove">

                        <div class="row">

                        <div class="col-md-7">

                          <h3><a href="">${headline}</a></h3>

                        </div>

                        <div class="col-md-5">

                          <div class="storefront-date"><span class="date-format">DD/MM/YY</span>, <span class="time-format">00:00</span></div>

                        </div>

                        <div class="clearfix"></div>

                      </div>

                      <div class="storefront-desc">

                        <div class="cart-top-sec-left"><img src="${image}" align="absmiddle" width="40"><span class="cart-publish-merchant">${consumer_name}</span></div>

                        <div class="cart-top-sec-right">

                          <div class="store-rating">  </div>

                        </div>

                        <div class="clearfix"></div>

                      </div>

                      <div class="cart-item-desc"> ${review}


                      </div>

                    </div>

                  </div>`
      
      $('#item-reviewed').append(reviewDiv);

      $(`#${id} .store-rating`).starrr({
        rating: rating,
        readOnly: true
      })

      $(`#${id} .store-rating`).css({pointerEvents: "none"});



    }
      


 
  return {
    appendReviewModal: appendReviewModal,
    giveItemFeedback: giveItemFeedback,
    getRating: getRating,
    submitFeedback: submitFeedback,
    closePopup: closePopup,
    saveFeedback: saveFeedback,
    getMerchantReviews : getMerchantReviews
    
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


var merchantListSearch = (function (){
    var instance;
    function init(){
     
    function alterInterface()
    {
       let customDiv =  `<div class="container">
                <div class="row">
                    <div class="col-md-4">
                        <div class="storefront-top-action box-merchant-wrapper item-filter">
                            <div class="row">
                                <div class="col-md-12">
                                   
                                        <div>
                                            <div class="custom-form-group">
                                                <h4>What service are you looking for? </h4>
                                            </div>
                                            <div class="custom-form-group">
                                                <label for="">Keyword</label>
                                                <div class="search-group">
                                                    <input type="text" id="merchant-keyword" class="custom-control form-control" placeholder="Search with display name " name="search-item">
                                                    <input type="button" value="" id="go-search" class="btn-search"> 
                                                </div>
                                            </div>
                                            <div class="custom-form-group">
                                                <label for="">Categories</label>
                                                <div class="checkbox-wrapper" id="category-div">
                                                   
                                                    
                                                </div>
                                            </div>
                                            <div class="custom-form-group">
                                                <label for="">Country</label>
                                                <div class="search-group">
                                                    <input type="text" class="custom-control form-control" name="search-country" id="country">
                                                </div>
                                            </div>
                                            <div class="custom-form-group">
                                                <label for="">State</label>
                                                <div class="search-group">
                                                    <input type="text" class="custom-control form-control" name="search-state" id="state">
                                                </div>
                                            </div>
                                            <div class="custom-form-group">
                                                <label for="">City / Zipcode</label>
                                                <div class="search-group">
                                                    <input type="text" class="custom-control form-control" name="search-city" id="city">
                                                </div>
                                            </div>
                                            <button type="" class="btn custom-search-btn" id="search-value">Search</button>
                                        </div>
                                 
                                </div>
                            </div>
                            <div class="clearfix"></div>
                        </div> 
                    </div>
                    <div class="col-md-8">
                        <div class="storefront-top-action">
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="item-filter">
                                        <form method="get">
                                            <ul>
                                                <li>
                                                    <label>Sort by :</label>
                                                    <select name="sortby">
                                                        <option>Name-Ascending</option>
                                                        <option>Name-Descending</option>
                                                        <option>Rating-Highest</option>
                                                    </select>
                                                </li>
                                            </ul>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div class="clearfix"></div>
                        </div>
                        <div class="box-merchant-main">
                            <div class="row">
                               
                                
                            </div>
                        </div>
                    </div>
                </div>
                        </div>`;

      $('.section-item-wishlist .container').hide();
      $('.section-item-wishlist').prepend(customDiv);

    }
      
    function searchByKeyword(keyword){
        var data = { keyword };
          console.log(data);
          var apiUrl = packagePath + '/get_merchant_by_keyword.php';
          $.ajax({ 
            url: apiUrl,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response)
            {
              console.table(response);
              const results = JSON.parse(response);
              const merchants = results.result;
              merchants.Records.forEach(function (merchant, i)
              {
                  let merchantDiv = ` <div class="col-md-3 col">
                                      <div class="box-merchant"> <img src="${merchant['Media'][0]['MediaUrl']}">
                                          <div class="merchant-description">
                                              <h4>${merchant['DisplayName']}</h4> </div>
                                      </div>
                                  </div>`
                $('.box-merchant-main .row').append(merchantDiv);

              })

            },
            error: function (jqXHR, status, err)
            {
              // toastr.error('---');
            }
         });
      }
      
    function searchByCategory(categories,code){
          var data = { categories, code };
          console.log(data);
          var apiUrl = packagePath + '/get_merchant_by_categories.php';
          $.ajax({ 
            url: apiUrl,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response)
            {
              console.table(response);
              const results = JSON.parse(response);
              const merchants = results.result;
              console.table(merchants.Records);
              $('.box-merchant-main .row').empty();
              merchants.Records.forEach(function (merchant, i)
              {

                var userData = getCustomFields.getInstance();
                
                userData.getConsumerDetails(merchant.replace("'", ''), function (result)
                {
                  let merchantDiv = ` <div class="col-md-3 col">
                                      <div class="box-merchant"> <img src="${result['Media'][0]['MediaUrl']}">
                                          <div class="merchant-description">
                                              <h4>${result['DisplayName']}</h4> </div>
                                      </div>
                                  </div>`
                $('.box-merchant-main .row').append(merchantDiv);
                })

              })

            },
            error: function (jqXHR, status, err)
            {
              // toastr.error('---');
            }
         });
      }
      
    function searchByValue(value_country, code_country, value_state, code_state, value_city, code_city, combination)
    {
        var data = { value_country, code_country, value_state, code_state, value_city, code_city, combination };
          console.log(data);
          var apiUrl = packagePath + '/get_merchant_by_value.php';
          $.ajax({ 
            url: apiUrl,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response)
            {
              console.table(response);
              const results = JSON.parse(response);
              const merchants = results.result;
              console.table(merchants.Records);
              $('.box-merchant-main .row').empty();
              merchants.Records.forEach(function (merchant, i)
              {

                var userData = getCustomFields.getInstance();
                
                userData.getConsumerDetails(merchant.replace("'", ''), function (result)
                {
                  let merchantDiv = ` <div class="col-md-3 col">
                                      <div class="box-merchant"> <img src="${result['Media'][0]['MediaUrl']}">
                                          <div class="merchant-description">
                                              <h4>${result['DisplayName']}</h4> </div>
                                      </div>
                                  </div>`
                $('.box-merchant-main .row').append(merchantDiv);
                })

              })

            },
            error: function (jqXHR, status, err)
            {
              // toastr.error('---');
            }
         });
    }
       
    function renderCategoriesCustomfields()
    {
          var apiUrl = packagePath + '/get_merchant_categories.php';
          $.ajax({ 
            url: apiUrl,
            method: 'POST',
            contentType: 'application/json',
           // data: JSON.stringify(data),
            success: function (response)
            {
              console.table(response);
              const results = JSON.parse(response);
              const merchantCategories = [];
              const categories = results.result['Records'].filter(record => record.Name === "Categories");
              const country = results.result['Records'].filter(record => record.Name === "Country");
              countryCode = country[0]['Code'];
              const state = results.result['Records'].filter(record => record.Name === "State");
              stateCode = state[0]['Code'];
              const city = results.result['Records'].filter(record => record.Name === "City / Zipcode");
              cityCode = city[0]['Code'];
              
              console.table(categories);
              if (categories) {
                const options = categories[0]['Options'];
                const categoryCode = categories[0]['Code'];
                $('#category-div').attr('custom-id', categoryCode)
                
                  options.forEach(function (category, i)
                  { 
                    let categoryOptions  =  ` <label class="co-form-control">
                                                        <input type="checkbox" name="checkbox" value="${category['Name']}">
                                                        ${category['Name']}
                                                    </label>`
                    $('#category-div').append(categoryOptions);
                  })
                 
            
              }

           

            },
            error: function (jqXHR, status, err)
            {
              // toastr.error('---');
            }
         });
    }
      
    

    
      return {
        
        alterInterface: alterInterface,
        searchByKeyword: searchByKeyword,
        renderCategoriesCustomfields: renderCategoriesCustomfields,
        searchByCategory: searchByCategory,
        searchByValue : searchByValue
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

    //store front
    if (urls.indexOf('/user/merchantaccount')) {
    
       $('head').append(`<script type="text/javascript" src="https://bootstrap.arcadier.com/spacetime/js/rating.js"></script>`);
      var reviewAction = merchantReview.getInstance(); 
      
      reviewAction.getMerchantReviews($('#storefrontMerchantGuid').val());

    //on scroll, since reviews are not paginated
      //    window.onscroll = function (ev)
      // {
      //    //appending the status in select element
      // waitForElement(".cart-item-row", function ()
      // {
      //   console.log('in onscroll');
      //   reviewAction.getMerchantReviews($('#storefrontMerchantGuid').val());

      
      // });
        
      // };


    }

    if (urls.indexOf('/user/marketplace/merchant-list')) {
      var merchantSearch = merchantListSearch.getInstance(); 
      merchantSearch.alterInterface();
       merchantSearch.renderCategoriesCustomfields();

    $('body').on('click', '#go-search', function (){

      merchantSearch.searchByKeyword($('#merchant-keyword').val());


    });  
      
    //search by category
      jQuery('body').on('change', '#category-div', function ()
      {
     
        selectedCategories = []
        $('#category-div').find('input[type=checkbox]').each(function ()
        {
        
          this.checked ? selectedCategories.push($(this).val()) : "";
          //console.log({ selectedCategories })
        
        });

        merchantSearch.searchByCategory(selectedCategories.toString(), $('#category-div').attr('custom-id'));

      });

      $('body').on('click', '#search-value', function ()
      {
        merchantSearch.searchByValue($('#country').val(),countryCode, $('#state').val(),stateCode,$('#city').val(),cityCode, 1);
      })


        
    }


  });
})();
