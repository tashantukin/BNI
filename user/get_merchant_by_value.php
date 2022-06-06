<?php
include 'callAPI.php';
include 'admin_token.php';
$contentBodyJson = file_get_contents('php://input');
$content = json_decode($contentBodyJson, true);


$country_value = $content['value_country'];
$country_custom_code =$content['code_country'];

$state_value = $content['value_state'];
$state_custom_code =$content['code_state'];

$city_value = $content['value_city'];
$city_custom_code =$content['code_city'];

$baseUrl = getMarketplaceBaseUrl();
$admin_token = getAdminToken();

$url = $baseUrl . '/api/v2/users/';
$result = callAPI("GET", $admin_token['access_token'], $url, false);
$admin_id = $result['ID'];

$userToken = $_COOKIE["webapitoken"];

$url = $baseUrl . '/api/v2/users/'; 
$result = callAPI("GET", $userToken, $url, false);
$userId = $result['ID'];

//get the item details
$details =  array(array('Code' => $country_custom_code, "Operator" => "equal",'Value' => $country_value), array('Code' => $state_custom_code, "Operator" => "equal",'Value' => $state_value), array('Code' => $city_custom_code, "Operator" => "equal",'Value' => $city_value) );
           
         
$url =  $baseUrl . '/api/v2/admins/'. $admin_id .'/custom-field-values?referenceTable=Users';
 
$itemDetails = callAPI("POST", $admin_token['access_token'], $url, $details);
echo json_encode(['result' => $itemDetails]);

?>