<!DOCTYPE html>
<html lang="en">
<head>
	<title>Server Status</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width">
	<link rel="stylesheet" href="./vendor/bootstrap-2.3.1/css/bootstrap.min.css">
	<link rel="stylesheet" href="./vendor/jquery/css/smoothness/jquery-ui-1.10.2.custom.min.css">
	<link rel="stylesheet" href="./vendor/chromatable/chromatable.css">
	<link rel="stylesheet" href="./assets/css/styles.css">
	<link rel="stylesheet" href="./assets/css/styles-responsive.css">
	<link rel="shortcut icon" href="./favicon.ico">
</head>
<body>
	<div class="navbar navbar-inverse navbar-fixed-top">
		<div class="navbar-inner">
			<div class="container">
				<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</a>
				<a class="brand"><img alt="e-works media, inc." src="./assets/images/ewm_logo_white.png"></a>
				<div class="nav-collapse collapse">
					<ul class="nav">
						<li class="dropdown">
							<a class="dropdown-toggle" data-toggle="dropdown"><span id="selected-server" style="color:#fff;">select server</span> <b class="caret"></b></a>
							<ul id="server-dropdown" class="dropdown-menu"></ul>
						</li><!--/.dropdown -->
						<li class="dropdown">
							<a class="dropdown-toggle" data-toggle="dropdown"><i class="icon-cog icon-white"></i> <b class="caret"></b></a>
							<ul class="dropdown-menu">
								<li class="dropdown-submenu">
									<a tabindex="-1" href="#">Load Style</a>
									<ul class="dropdown-menu load-style">
										<li><a data-load-style="polling"><input onClick="this.parentNode.click(); return false;" type="checkbox" /> Long Polling</a></li>
										<li><a data-load-style="event"><input onClick="this.parentNode.click(); return false;" type="checkbox" /> Event Stream</a></li>
									</ul>
								</li><!--/.dropdown-submenu -->
								<li class="dropdown-submenu">
									<a tabindex="-1" href="#">Long Poll Delay</a>
									<ul class="dropdown-menu poll-delay">
										<li><a data-poll-delay="2000"><input onClick="this.parentNode.click(); return false;" type="checkbox" /> 2 seconds</a></li>
										<li><a data-poll-delay="5000"><input onClick="this.parentNode.click(); return false;" type="checkbox" />5 seconds</a></li>
										<li><a data-poll-delay="10000"><input onClick="this.parentNode.click(); return false;" type="checkbox" />10 seconds</a></li>
										<li><a data-poll-delay="20000"><input onClick="this.parentNode.click(); return false;" type="checkbox" />20 seconds</a></li>
									</ul>
								</li><!--/.dropdown-submenu -->
							</ul><!--/.dropdown-menu -->
						</li><!--/.dropdown -->
					</ul><!--/.nav -->
				</div><!--/.nav-collapse -->
			</div><!--/.container -->
		</div><!--/.navbar-inner -->
	</div><!--/.navbar -->
	<div id="content-container" class="container">
		<div id="overlay" style="display:none;">
			<div style="display:table;width:100%;height:100%;">
				<div style="display:table-cell;vertical-align:middle;"><img src="./assets/images/loader.gif"></div>
			</div>
		</div><!--/#overlay -->
		<div class="row" style="margin-bottom:0;">
			<div class="span8">
				<div class="row">
					<div class="span4">
						<div class="content-box">
							<h2>Uptime</h2>
							<p><span id="uptime-days" class="loud">0</span> <span class="loud-modifier">days</span></p>
							<p>
								<span class="loud-modifier" style="font-size:20px;">
									<span id="uptime-hours" style="color:#333;font-weight:bold;">0</span> hours <span id="uptime-minutes" style="color:#333;font-weight:bold;">0</span> minutes
								</span>
							</p>
							<p style="font-size:11px;margin:0;"><span id="distro-os"></span> | <span id="distro-version"></span> <span id="distro-arch"></span></p>
						</div><!--/.content-box -->
					</div><!--/.span4 -->
					<div class="span4">
						<div class="content-box">
							<h2>CPU Load</h2>
							<p><span id="cpu-used" class="loud">0</span> <span class="loud-modifier">%</span></p>
							<p>
								<span class="loud-modifier" style="font-size:20px;">
									<span id="cpu-idle" style="color:#333;font-weight:bold;">0</span> % idle
								</span>
							</p>
						</div><!--/.content-box -->
				   </div><!--/.span4 -->
				</div><!--/.row -->
				<div class="row">
					<div class="span4">
						<div class="content-box">
							<h2>Memory</h2>
							<p><span id="memory-used" class="loud">0</span> <span class="loud-modifier">gb</span></p>
							<p>
								<span class="loud-modifier" style="font-size:20px;">
									<span id="memory-free" style="color:#333;font-weight:bold;">0</span> gb free
								</span>
							</p>
						</div><!--/.content-box -->
					</div><!--/.span4 -->
					<div class="span4">
						<div class="content-box">
							<h2>Drives</h2>
							<table id="drives" class="table-striped table-hover table-condensed">
								<thead>
									<tr>
										<th class="ttip" data-toggle="tooltip" title="File System">FS</th>
										<th>Size</th>
										<th>Used</th>
										<th>%</th>
										<th>Free</th>
										<th class="ttip" data-toggle="tooltip" title="Mount Point">MP</th>
									</tr>
								</thead>
								<tbody>
									
								</tbody>
							</table>
						</div><!--/.content-box -->
					</div><!--/.span4 -->
				</div><!--/.row -->
			</div><!--/.span8 -->
			<div class="span4">
				<div class="content-box two-rows">
					<h2>Services</h2>
					<table id="services" class="table-striped table-hover table-condensed">
						<thead>
							<tr>
								<th>Name</th>
								<th>Port</th>
								<th>On</th>
								<th>Manage</th>
							</tr>
						</thead>
						<tbody>
							
						</tbody>
					</table>
				</div><!--/.content-box -->
			</div><!--/.span4 -->
		</div><!--/.row -->
		<div class="row">
			<div class="span4">
				<div class="content-box two-rows">
					<h2>Software</h2>
					<table id="software" class="table-striped table-hover table-condensed">
						<thead>
							<tr>
								<th>Package Name</th>
								<th>Version</th>
							</tr>
						</thead>
						<tbody>
							
						</tbody>
					</table>
				</div><!--/.content-box -->
			</div><!--/.span4 -->
			<div class="span4">
				<div class="content-box two-rows">
					<h2>Domains</h2>
					<table id="domains" class="table-striped table-hover table-condensed">
						<thead>
							<tr>
								<th>Name</th>
								<th>Size</th>
							</tr>
						</thead>
						<tbody>
						
						</tbody>
					</table>
				</div><!--/.content-box -->
			</div><!--/.span4 -->
			<div class="span4">
				<div class="content-box two-rows">
					<h2>CPU Info</h2>
					<table id="cpus" class="table-striped table-hover table-condensed">
						<thead>
							<tr>
								<th>ID</th>
								<th>Cores</th>
								<th>Model</th>
							</tr>
						</thead>
						<tbody>
						
						</tbody>
					</table>
				</div><!--/.content-box -->
			</div><!--/.span4 -->
		</div><!--/.row -->
	</div><!--/.container -->
	<div id="start-box-container">
		<div style="display:table;width:100%;height:100%;">
			<div style="display:table-cell;vertical-align:top;">
				<div id="start-box">
					<h2>server</h2>
					<select id="start-server" style="margin:10px 0 20px 0;">
						<option value="">select one</option>
					</select>
				</div>
			</div>
		</div>
	</div><!--/#start-box-container -->
	<div id="generic-error-modal" class="modal hide fade">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
			<h3>Error</h3>
		</div>
		<div class="modal-body">
			<p></p>
		</div>
		<div class="modal-footer">
			<a href="javascript:$('#generic-error-modal').modal('hide');" class="btn">Close</a>
		</div>
	</div><!--/#start-box-container -->
	
	<script src="./vendor/jquery/jquery-1.9.1.min.js" type="text/javascript"></script>
	<script src="./vendor/jquery/jquery-ui-1.10.2.custom.min.js" type="text/javascript"></script>
	<script src="./vendor/bootstrap-2.3.1/js/bootstrap.min.js" type="text/javascript"></script>
	<script src="./vendor/chromatable/jquery.chromatable.js" type="text/javascript"></script>
	<script src="./vendor/base64.js" type="text/javascript"></script>
	<script src="./vendor/eventsource.js" type="text/javascript"></script>
	<script src="./assets/scripts/server.status.js" type="text/javascript"></script>
	<script src="./assets/scripts/application.js" type="text/javascript"></script>
</body>
</html>