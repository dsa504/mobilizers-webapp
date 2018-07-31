<?php
/*
Plugin Name: DSA New Orleans Mobilizers Webapp
Description: Webapp for matching mobilizers with new DSA chapter members.
Author: Trey Daniel, Steve Price
*/

namespace Mobilizers\WebApp;

register_activation_hook(__FILE__, activate);

register_deactivation_hook(__FILE__, deactivate);

register_uninstall_hook(__FILE__, uninstall);

function activate() {

}

function deactivate() {

}

function uninstall() {

}

?>