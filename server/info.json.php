<?php
/**
  * @author http://www.e-worksmedia.com
  * @version 1.0.0
  *
  * LICENSE: BSD 3-Clause
  *
  * Copyright (c) 2013, e-works media, inc.
  * All rights reserved.
  * 
  * Redistribution and use in source and binary forms,
  * with or without modification, are permitted provided
  * that the following conditions are met:
  * 
  * -Redistributions of source code must retain the above
  * copyright notice, this list of conditions and the
  * following disclaimer.
  * 
  * -Redistributions in binary form must reproduce the
  * above copyright notice, this list of conditions and
  * the following disclaimer in the documentation and/or
  * other materials provided with the distribution.
  * 
  * -Neither the name of e-works media, inc. nor the names
  * of its contributors may be used to endorse or promote
  * products derived from this software without specific
  * prior written permission.
  * 
  * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS
  * AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
  * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
  * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
  * THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY
  * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
  * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF
  * USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
  * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
  * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
  * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  * 
**/

/**
	Respond to Pre-Flight requests
**/
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
	header('Access-Control-Allow-Origin: http://www.domain-hosting-dashboard.com');
	header('Access-Control-Allow-Methods: GET');
	header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
	header('Access-Control-Allow-Credentials: true');
	header('Access-Control-Max-Age: 86400');
	exit;
}

header('Cache-Control: no-cache');
header('Content-type: application/json');
header('Access-Control-Allow-Origin: http://www.domain-hosting-dashboard.com');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Credentials: true');

require_once './classes/Server.class.php';

$uptime = Server::getUpTime();
$cpu = Server::getCPUInfo();
$memory = Server::getMemoryInfo();
$drive = Server::getDrivesInfo();
$services = Server::getServicesInfo(array(
	/*
		example = array('name'=>'POSTGRES', 'service'=>'postgres', 'process'=>'postgresql', 'command'=>'postgres')
		name = display name
		service = name of tcp service to get port via getservbyname()
		process = name of running process
		command = optional command name if process runs under different name
	*/
	array('name'	=>	'DNS', 		'service'		=>	'domain', 	'process'	=>	'named'),
	array('name'	=>	'HTTP', 	'service'		=>	'http', 	'process'	=>	'httpd'),
	array('name'	=>	'HTTPS', 	'service'		=>	'https', 	'process'	=>	'httpd'),
	array('name'	=>	'NGINX', 	'service'		=>	'',		 	'process'	=>	'nginx'),
	array('name'	=>	'MYSQL', 	'service'		=>	'mysql', 	'process'	=>	'mysqld'),
	array('name'	=>	'IMAP', 	'service'		=>	'imap', 	'process'	=>	'postfix'),
	array('name'	=>	'IMAP-SSL', 'service'		=>	'imaps', 	'process'	=>	'postfix'),
	array('name'	=>	'SMTP', 	'service'		=>	'smtp', 	'process'	=>	'postfix'),
	array('name'	=>	'SMTP-SSL', 'service'		=>	'smtps', 	'process'	=>	'postfix'),
	array('name'	=>	'FTP', 		'service'		=>	'ftp', 		'process'	=>	'vsftpd'),
	array('name'	=>	'SFTP',		'service'		=>	'sftp',		'process'	=>	'vsftpd'),
	array('name'	=>	'SSH', 		'service'		=>	'ssh', 		'process'	=>	'sshd')
));
$software = Server::getSoftwareInfo();
$domains = Server::getDomainList('/var/www/vhosts', array(
	'.skel',
	'awstats',
	'chroot',
	'default',
	'fs',
	'fs-passwd',
	'httpsdocs'
));

$json = json_encode(array(
	'uptime'	=>	$uptime,
	'cpu'		=>	$cpu,
	'memory'	=>	$memory,
	'drive'		=>	$drive,
	'services'	=>	$services,
	'software'	=>	$software,
	'domains'	=>	$domains
));
print $json;

?>