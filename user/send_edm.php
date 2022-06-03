@@ -1,140 +0,0 @@
<?php
include 'callAPI.php';
include 'admin_token.php';
$contentBodyJson = file_get_contents('php://input');
$content = json_decode($contentBodyJson, true);
$merchantId = $content['merchantguid'];
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

$url = $baseUrl . '/api/v2/users/' . $userId;
$merchant_details = callAPI("GET", null, $url, false);
$mechant_name = $merchant_details['DisplayName'];

//update the buyer's review status, 
$url = $baseUrl . '/api/v2/admins/'. $admin_id . '/custom-field-definitions';
$packageCustomFields = callAPI("GET", $admin_token['access_token'], $url, false);
$review_code;

    foreach ($packageCustomFields as $cf) {
        if ($cf['Name'] == 'reviewed') {
               $review_code = $cf['Code'];
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
    echo json_encode(['date' => $data]);    
    $url = $baseUrl . '/api/v2/users/' . $userId;
    echo json_encode(['url' => $url]);
    $result = callAPI("PUT", $admin_token['access_token'], $url, $data);
    echo json_encode(['result' => $result]);



$emails =  $content['emails'];
$mp_url = $baseUrl .'/user/marketplace/customlogin?isSeller=false&isInvited=true&merchant_guid='. $userId;
       foreach($emails as $email) {
            //send the EDM
            
                $subject = 'Merchant Invite';
                $data = [
                    'From' => $merchant_details['Email'],
                    'To' => $email,
                    'Cc' => $admin_email,
                    'Subject' => $subject,
                    'Body' =>  "<html>
                    <body>
                    <div style=\"max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif; line-height:25px;\">
                    <div style=\"padding:15px;\">
                    <div style=\"text-align:center; margin-bottom:50px;\"> <img src=\"http://bootstrap.arcadier.com/marketplace/images/logo.png\" style=\"max-width:200px;\" /> </div>
                    <div style=\"margin-bottom:35px;\">
                        <p style=\"color:#000; font-weight:bold; margin-bottom:40px;\">Hi,</p>
                        <p style=\"margin-bottom:20px;\">Thank you for providing an opportunity to serve your needs. We really enjoyed working with you. We request you to provide a rating and a review about the services you have received from us. You will be entered in a weekly sweepstakes to win a prize upon creating a free account and writing the review. You can also search service providers like us on this free website for your future needs.</p>
                        <p style=\"margin-bottom:20px;\">Here is the link to the customer portal to create a free account and write a review.</p>
                        
                        <p style=\"margin-top:10px;\"><a href=$mp_url style=\"color:#FF5A60; text-decoration: none; outline: none; font-weight: 600;\" target=\"_blank\">https://BNImarketplace.io</a></p>
                        </div>

                        <div style=\"margin-bottom:50px;\">
                        <p style=\"margin-top:0px;\">Thank You,<br>$merchant_name <br></p>
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


       }
           
           
       