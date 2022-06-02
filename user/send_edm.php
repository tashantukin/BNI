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

$url = $baseUrl . '/api/v2/users/' . $merchantId;
$merchant_details = callAPI("GET", null, $url, false);
$mechant_name = $merchant_details['DisplayName'];

$emails =  $content['emails'];
$mp_url = $baseUrl .'/user/marketplace/customlogin?isSeller=false&isInvited=true';
       foreach($emails as $email) {
            //send the EDM
            
                $subject = 'New order interest';
                $data = [
                    'From' => $merchant_details['Email'],
                    'To' => $email,
                    'Cc' => $admin_email,
                    'Subject' => $subject,
                    'Body' =>  "<html> <body><div style=\"max-width:700px; width:100%; margin:0 auto; border:1px solid #ddd; color:#999; font-size:16px; font-family:sans-serif;  line-height:25px;\">

                    <div style=\"padding:15px;\">
                
                    <div style=\"text-align:center; margin-bottom:50px;\"> <img src=\"http://bootstrap.arcadier.com/marketplace/images/logo.png\" style=\"max-width:200px;\" /> </div>
                
                    <div>
                
                        <p style=\"color:#000; font-weight:bold; margin-bottom:50px;\">Hello Buyer name,</p>
                
                        <p>Thank you for providing an opportunity to serve your needs. We really enjoyed working with you on landscaping project. We request you to provide a rating about the services you have received from us.
                        You will be entered in a weekly sweepstakes to win a XXX upon writing the review and creating a free account. You can also search service providers like us on this free website for your future needs.
            
                      
                        
                    </div>
                
                    <div style=\"border-bottom:1px solid #000; border-top:1px solid #000; padding-top: 10px; padding-bottom: 10px; margin-top:50px;\">
                  Here is the link to the customer portal to write a review and create a free account. <a href=$mp_url style=\"color:#FF5A60; word-break:break-all; text-decoration:none; font-weight:bold;\"> BNI Customer Portal</a>.</p>
                
                    </div>
                
           
                
                    <div style=\"margin-bottom:50px;\">
                
                        <p>Thank You,<br />
                
                        $mechant_name</p>
                
                      
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
           
           
       