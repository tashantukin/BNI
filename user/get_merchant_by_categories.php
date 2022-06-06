<?php
include 'callAPI.php';
include 'admin_token.php';
$contentBodyJson = file_get_contents('php://input');
$content = json_decode($contentBodyJson, true);
$category_list = $content['categories'];
$category_custom_code =$content['code'];


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
$details = array(array('Code' => $category_custom_code, "Operator" => "in",'Value' => $category_list));

$url =  $baseUrl . '/api/v2/admins/'. $admin_id .'/custom-field-values?referenceTable=Users';
 
$itemDetails = callAPI("POST", $admin_token['access_token'], $url, $details);
echo json_encode(['result' => $itemDetails]);

?>