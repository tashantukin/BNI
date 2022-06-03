@@ -1,140 +0,0 @@
<?php
include 'callAPI.php';
include 'admin_token.php';
$contentBodyJson = file_get_contents('php://input');
$content = json_decode($contentBodyJson, true);
$merchantId = $content['merchant_guid'];
$notes = $content['notes'];
$itemguid = $content['itemguid'];

$baseUrl = getMarketplaceBaseUrl();
$admin_token = getAdminToken();
$customFieldPrefix = getCustomFieldPrefix();
// Query to get marketplace id
$userToken = $_COOKIE["webapitoken"];
$url = $baseUrl . '/api/v2/users/';
$result = callAPI("GET", $userToken, $url, false);
$userId = $result['ID'];
$userName = $result['DisplayName'];

$url = $baseUrl . '/api/v2/users/';
$result = callAPI("GET", $admin_token['access_token'], $url, false);
$admin_id = $result['ID'];
$admin_email =  $result['Email'];

$url = $baseUrl . '/api/v2/items/' . $itemId;
$item_details = callAPI("GET", null, $url, false);

$item_name = $item_details['Name'];
$item_currency = $item_details['CurrencyCode'];
$item_price = number_format((float)$item_details['Price'],2);
$item_sku = $item_details['SKU']; 
$item_seller_displayname = $item_details['MerchantDetail']['DisplayName'];
$item_image = $item_details['Media'][0]['MediaUrl'];

$url = $baseUrl . '/api/v2/users/' . $merchantId;
$merchant_details = callAPI("GET", null, $url, false);
$merchant_name = $merchant_details['DisplayName'];
$merchant_email = $merchant_details['Email'];


//update the buyer's review status, 
$url = $baseUrl . '/api/v2/admins/'. $admin_id . '/custom-field-definitions';
$packageCustomFields = callAPI("GET", $admin_token['access_token'], $url, false);
//$review_code='';

    foreach ($packageCustomFields['Records'] as $cf) {
        if ($cf['Name'] == 'reviewed') {
               $review_code = $cf['Code'];
               error_log($review_code);
        }  
    }
  $data = [
        'CustomFields' => [
            [
                'Code' => $review_code,
                'Values' => [ 'true' ],
            ],

    
        ],
    ];

error_log(json_encode($data));


    $url = $baseUrl . '/api/v2/users/' . $userId;
    $result = callAPI("PUT", $admin_token['access_token'], $url, $data);
    //echo json_encode(['result' => $result]);
    error_log(json_encode(['result cf' => $result]));

//$emails =  $content['emails'];
//$mp_url = $baseUrl .'/user/marketplace/customlogin?isSeller=false&isInvited=true&merchant_guid='. $userId;
      // foreach($emails as $email) {
            //send the EDM
            
                $subject = 'Consumer Rating Received';
                $data = [
                    'From' => $admin_email,
                    'To' => $merchant_email,
                    'Cc' => $admin_email,
                    'Subject' => $subject,
                    'Body' =>  "<html>
                                <body>
                                <div style=\"max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;\">
                                <div style=\"padding:15px;\">
                                <div style=\"text-align:center; margin-bottom:50px;\"> <img src=\"http://bootstrap.arcadier.com/marketplace/images/logo.png\" style=\"max-width:200px;\" /> </div>
                                <div style=\"margin-bottom:35px;\">
                                    <p style=\"color:#000; font-weight:bold; margin-bottom:40px;\">Hi $merchant_name ,</p>
                                    <p style=\"margin-bottom:20px;\">You have received a rating and review on the services provided to <span style=\"color:#000; font-weight:bold;\">$userName</span>. To view, please login to the customer portal by <a href=\"#\" style=\"color:#FF5A60; text-decoration: none; outline: none; font-weight: 600;\" target=\"_blank\">clicking here</a>.</p>

                                    </div>

                                    <div style=\"margin-bottom:50px;\">
                                    <p style=\"margin-top:0px;\">Thank You,<br>BNI Global Support Team<br></p>
                                    </div>
                                </div>
                                </div>
                                </body>
                                </html>"

                ];
                //error_log($data);
                $url =  $baseUrl . '/api/v2/admins/' . $admin_id .'/emails';
                $sendEDM = callAPI("POST", $admin_token['access_token'], $url, $data);
                echo json_encode(['result' => $sendEDM]);
                error_log(json_encode($sendEDM));


     //  }
           
           
       