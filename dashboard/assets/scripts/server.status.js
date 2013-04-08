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
var ServerStatus = (function(){
	/**
		Private
	**/
	var _useEventStream = false;
	var _endPoint = '';
	var _eventStream;
	var _longPoll;
	var _longPollTimeout = 0;
	var _longPollTimoutDelay = 5000;
	var _eventStreamFileName = 'info.event.json.php';
	var _longPollFileName = 'info.json.php';
	var _basicAuthUsername = '';
	var _basicAuthPassword = '';
	var _responseData = {};
	
	var _loadData = function(){
		if(_endPoint != ''){
			_clearView();
			_showLoading();
			if(_useEventStream){
				if(_eventStream) _closeEventStream();
				_eventStream = new EventSource(_endPoint + _eventStreamFileName, {
					withCredentials: true,
					headers: {
						'Authorization': _basicAuthHash(_basicAuthUsername, _basicAuthPassword)
					}	
				});
				_setupEventStreamDataListener();
			} else {
				_initLongPoll();
			}
		} else {
			_onError('No endpoint selected');	
		}
	};
	
	var _setupEventStreamDataListener = function(){
		_eventStream.addEventListener('message', _onEventStreamData);
	};
	
	var _closeEventStream = function(){
		_eventStream.removeEventListener('message', _onEventStreamData);
		_eventStream.close();	
	};
	
	var _onEventStreamData = function(e){
		_responseData = JSON.parse(e.data);
		_onData(_responseData);
	};
	
	var _initLongPollTimeout = function(){
		_longPollTimeout = setTimeout(_initLongPoll, _longPollTimoutDelay);	
	};
	
	var _initLongPoll = function(){
		_stopLongPoll();
		_longPoll = $.ajax({
			type: 'GET',
			url: _endPoint + _longPollFileName + '?i=' + Math.random(),
			crossDomain:true,
			xhrFields: {
				withCredentials: true
			},
			headers: {
				'Authorization': _basicAuthHash(_basicAuthUsername, _basicAuthPassword)
			},
			success: function(result, status, xhr) {
				_responseData = result;
				_onData(_responseData);
				_initLongPollTimeout();
			},
			error: function(xhr, status, error) {
				if(status != 'abort'){
					_hideLoading();
					_onError('Failed to load data. Trying again...');
					_initLongPollTimeout();
				}
			}
		});
	};
	
	var _stopLongPoll = function(){
		if(_longPoll) _longPoll.abort();
		clearTimeout(_longPollTimeout);	
	};
	
	var _stopLoad = function(){
		if(_useEventStream){
			_closeEventStream();
		} else {
			_stopLongPoll();
		}
	};
	
	var _onData = function(result){
		_responseData = result;
		_updateView();
	};
	
	var _onError = function(message){
		$('#generic-error-modal .modal-body p').html(message);
		$('#generic-error-modal').modal();
	};
	
	var _clearView = function(){
		// clear individual elements
		$('#uptime-days').html('0');
		$('#uptime-hours').html('0');
		$('#uptime-minutes').html('0');
		$('#cpu-used').html('0');
		$('#cpu-idle').html('0');
		$('#memory-used').html('0');
		$('#memory-free').html('0');
		$('#distro-os').html('');
		$('#distro-version').html('');
		$('#distro-arch').html('');
		// clear tables
		$('#drives tbody').html('');
		$('#services tbody').html('');	
		$('#software tbody').html('');
		$('#cpus tbody').html('');
		$('#domains tbody').html('');
	};
	
	var _updateView = function(){
		_updateHTML($('#uptime-days'), _responseData.uptime.days);
		_updateHTML($('#uptime-hours'), _responseData.uptime.hours.split(':')[0]);
		_updateHTML($('#uptime-minutes'), _responseData.uptime.hours.split(':')[1]);
		_updateHTML($('#cpu-used'), _responseData.cpu.used);
		_updateHTML($('#cpu-idle'), _responseData.cpu.idle);
		_updateHTML($('#memory-used'), _responseData.memory.used);
		_updateHTML($('#memory-free'), _responseData.memory.free);
		for(var i = 0; i < _responseData.drive.length; i++){
			var id = _cleanID(_responseData.drive[i].mounted);
			if($('#drive-' + id).length){
				var cname = parseInt(_responseData.drive[i].used_percent) > 35 && parseInt(_responseData.drive[i].used_percent) < 70 ? 'warning' : '';
				cname = parseInt(_responseData.drive[i].used_percent) > 70 ? 'error' : cname;
				$('#drive-' + id).removeClass('warning error');
				$('#drive-' + id).addClass(cname);
				_updateHTML($('#drive-' + id + ' .drive-filesystem'), _responseData.drive[i].file_system);
				_updateHTML($('#drive-' + id + ' .drive-size'), _responseData.drive[i].size);
				_updateHTML($('#drive-' + id + ' .drive-used'), _responseData.drive[i].used);
				_updateHTML($('#drive-' + id + ' .drive-used-percent'), _responseData.drive[i].used_percent);
				_updateHTML($('#drive-' + id + ' .drive-free'), _responseData.drive[i].free);
				_updateHTML($('#drive-' + id + ' .drive-mount'), _responseData.drive[i].mounted);
			} else {
				$('#drives tbody').append(_getDriveRowTemplate(_responseData.drive[i], id));
			}
		}
		if(!$('#drives').hasClass('_scrolling')){
			$('#drives').chromatable({
				width: '100%',
				height: '130px',
				scrolling: 'yes'
			});	
		}
		for(var i = 0; i < _responseData.services.length; i++){
			var id = _cleanID(_responseData.services[i].name);
			if($('#service-' + id).length){
				$('#service-' + id).removeClass('error');
				$('#service-' + id).addClass(_responseData.services[i].running ? '' : 'error');
				_updateHTML($('#service-' + id + ' .service-name'), _responseData.services[i].name);
				_updateHTML($('#service-' + id + ' .service-port'), _responseData.services[i].port);
				$('#service-' + id + ' .service-running span').removeClass('label-success label-important');
				$('#service-' + id + ' .service-running span').addClass('label-' + (_responseData.services[i].running ? 'success' : 'important'));
				_updateHTML($('#service-' + id + ' .service-running span'), (_responseData.services[i].running ? 'Yes' : 'No'));
				$('#service-' + id + ' .service-manage .btn-success').removeAttr('disabled');
				if(_responseData.services[i].running) $('#service-' + id + ' .service-manage .btn-success').attr('disabled', 'disabled'); 
				$('#service-' + id + ' .service-manage .btn-warning').removeAttr('disabled');
				if(!_responseData.services[i].running) $('#service-' + id + ' .service-manage .btn-warning').attr('disabled', 'disabled'); 
				$('#service-' + id + ' .service-manage .btn-danger').removeAttr('disabled');
				if(!_responseData.services[i].running) $('#service-' + id + ' .service-manage .btn-danger').attr('disabled', 'disabled'); 
				$('#service-' + id).data('popover').options.content = _getProcessPopupTemplate(_responseData.services[i].pids);
				$('#service-' + id).data('popover').setContent();
				$('#service-' + id).data('popover').$tip.addClass($('#service-' + id).data('popover').options.placement);
			} else {
				$('#services tbody').append(_getServiceRowTemplate(_responseData.services[i], id));
				$('#service-' + id).popover({
					title: _responseData.services[i].name,
					content:  _getProcessPopupTemplate(_responseData.services[i].pids),
					html: true,
					placement: 'left',
					trigger: 'hover',
					delay: { show: 500, hide: 100 },
					container: 'body'
				});
			}
		}
		if(!$('#services').hasClass('_scrolling')){
			$('#services').chromatable({
				width: '100%',
				height: '369px',
				scrolling: 'yes'
			});	
		}
		for(var i = 0; i < _responseData.software.packages.length; i++){
			var id = _cleanID(_responseData.software.packages[i].name);
			if($('#software-' + id).length){
				_updateHTML($('#software-' + id + ' .software-name'), _responseData.software.packages[i].name);
				_updateHTML($('#software-' + id + ' .software-version'), _responseData.software.packages[i].version);
				$('#software-' + id).data('popover').options.content = _getSoftwarePopupTemplate(_responseData.software.packages[i]);
				$('#software-' + id).data('popover').setContent();
				$('#software-' + id).data('popover').$tip.addClass($('#software-' + id).data('popover').options.placement);
			} else {
				$('#software tbody').append(_getSoftwareRowTemplate(_responseData.software.packages[i], id));
				$('#software-' + id).popover({
					title: _responseData.software.packages[i].name,
					content:  _getSoftwarePopupTemplate(_responseData.software.packages[i]),
					html: true,
					placement: 'right',
					trigger: 'hover',
					delay: { show: 500, hide: 100 },
					container: 'body'
				});
			}
		}
		if(!$('#software').hasClass('_scrolling')){
			$('#software').chromatable({
				width: '100%',
				height: '369px',
				scrolling: 'yes'
			});	
		}
		$('#distro-os').html(_responseData.software.distro.operating_system);
		$('#distro-version').html(_responseData.software.distro.kernal_version);
		$('#distro-arch').html(_responseData.software.distro.kernal_arch);
		for(var i = 0; i < _responseData.cpu.cpus.length; i++){
			var id = _cleanID(_responseData.cpu.cpus[i].model_name + i);
			if($('#cpu-' + id).length){
				_updateHTML($('#cpu-' + id + ' .cpu-id'), _responseData.cpu.cpus[i].core_id);
				_updateHTML($('#cpu-' + id + ' .cpu-cores'), _responseData.cpu.cpus[i].cpu_cores);
				_updateHTML($('#cpu-' + id + ' .cpu-name'), _responseData.cpu.cpus[i].model_name);
				$('#cpu-' + id).data('popover').options.content = _getCPUPopupTemplate(_responseData.cpu.cpus[i]);
				$('#cpu-' + id).data('popover').setContent();
				$('#cpu-' + id).data('popover').$tip.addClass($('#cpu-' + id).data('popover').options.placement);
			} else {
				$('#cpus tbody').append(_getCpusRowTemplate(_responseData.cpu.cpus[i], id));
				$('#cpu-' + id).popover({
					title: _responseData.cpu.cpus[i].model_name,
					content:  _getCPUPopupTemplate(_responseData.cpu.cpus[i]),
					html: true,
					placement: 'left',
					trigger: 'hover',
					delay: { show: 500, hide: 100 },
					container: 'body'
				});
			}
		}
		if(!$('#cpus').hasClass('_scrolling')){
			$('#cpus').chromatable({
				width: '100%',
				height: '369px',
				scrolling: 'yes'
			});	
		}
		for(var i = 0; i < _responseData.domains.length; i++){
			var id = _cleanID(_responseData.domains[i].name);
			if($('#domain-' + id).length){
				_updateHTML($('#domain-' + id + ' .domain-name'), '<a href="http://' + _responseData.domains[i].name + '" target="_blank">' + _responseData.domains[i].name + '</a>');
				_updateHTML($('#domain-' + id + ' .domain-size'), _responseData.domains[i].size);
			} else {
				$('#domains tbody').append(_getDomainsRowTemplate(_responseData.domains[i], id));
			}
		}
		if(!$('#domains').hasClass('_scrolling')){
			$('#domains').chromatable({
				width: '100%',
				height: '369px',
				scrolling: 'yes'
			});	
		}
		_initExtras();
		_hideLoading();
	};
	
	var _initExtras = function(){
		$('.modal').modal('hide');
		$('.ttip').tooltip({
			container: 'body'	
		});
		$('.action-process').each(function(index, element) {
			$(this).click(function(e) {
				if($(this).attr('data-process') && $(this).attr('data-process-action')) {
					_showLoading();
					$.ajax({
						type: 'GET', 
						dataType : 'jsonp', 
						url: _endPoint + 'manage-service.json.php?i=' + Math.random() + '&callback=?', 
						data: 'process=' + $(this).attr('data-process') + '&action=' + $(this).attr('data-process-action'),
						timeout: 7000,
						success: function(result) {
							_hideLoading();
							if(!result.success){
								_onError('Failed to execute action.');
							}
						},
						error: function(result) {
							_hideLoading();
							_onError('Failed to reach server.');
						}
					});
				}
			});
		});	
	};
	
	var _getDriveRowTemplate = function(record, id){
		var cname = parseInt(record.used_percent) > 35 && parseInt(record.used_percent) < 70 ? 'warning' : '';
		cname = parseInt(record.used_percent) > 70 ? 'error' : cname;
		var html = '<tr id="drive-' + id + '" class="' + cname + '">';
		html += 	'	<td class="drive-filesystem">' + record.file_system + '</td>';
		html +=		'	<td class="drive-size">' + record.size + '</td>';
		html +=		'	<td class="drive-used">' + record.used + '</td>';
		html +=		'	<td class="drive-used-percent">' + record.used_percent + '</td>';
		html +=		'	<td class="drive-free">' + record.free + '</td>';
		html +=		'	<td class="drive-mount">' + record.mounted + '</td>';
		html +=		'</tr>';
		return html;	
	};
	
	var _getServiceRowTemplate = function(record, id){
		var html = '<tr id="service-' + id + '" class="' + (record.running ? '' : 'error') + ' hover-popover">';
		html += 	'	<td class="service-name">' + record.name + '</td>';
		html += 	'	<td class="service-port">' + (record.port ? record.port : '') + '</td>';
		html += 	'	<td class="service-running"><span class="label label-' + (record.running ? 'success' : 'important') + '">' + (record.running ? 'Yes' : 'No') + '</span></td>';
		html += 	'	<td class="service-manage">';
		html += 	'		<button class="btn btn-mini btn-success action-process" type="button" data-process="' + record.process + '" data-process-action="start"' + (record.running ? ' disabled' : '') + '><i class="icon-play icon-white"></i></button>&nbsp;';
		html += 	'		<button class="btn btn-mini btn-warning action-process" type="button" data-process="' + record.process + '" data-process-action="restart"' + (record.running ? '' : ' disabled') + '><i class="icon-refresh icon-white"></i></button>&nbsp;';
		html += 	'		<button class="btn btn-mini btn-danger action-process" type="button" data-process="' + record.process + '" data-process-action="stop"' + (record.running ? '' : ' disabled') + '><i class="icon-stop icon-white"></i></button>';
		html += 	'	</td>';
		html += 	'</tr>'	;
		return html;
	};
	
	var _getProcessPopupTemplate = function(record){
		var html = '<table class="table table-striped table-condensed" style="table-layout:fixed;">';
		html +=		'	<thead>';
		html +=		'	<tr>';
		html +=		'			<th width="20%">PID</th>';
		html +=		'			<th width="25%">User</th>';
		html +=		'			<th width="20%">CPU</th>';
		html +=		'			<th width="35%">Time Alive</th>';
		html +=		'		</tr>';
		html +=		'	</thead>';
		html +=		'	<tbody>';
		for(var i = 0; i < record.length; i++){
			html +=		'<tr>';
			html +=		'	<td>' + record[i].pid + '</td>';
			html +=		'	<td>' + record[i].user + '</td>';
			html +=		'	<td>' + record[i].cpu + '%</td>';
			html +=		'	<td>' + (parseInt(record[i].started.days) > 0 ? parseInt(record[i].started.days) + 'd ' : '') + (parseInt(record[i].started.hours) > 0 ? parseInt(record[i].started.hours) + 'h ' : '') + (parseInt(record[i].started.minutes) > 0 ? parseInt(record[i].started.minutes) + 'm ' : '') + parseInt(record[i].started.seconds) + 's</td>';
			html +=		'</tr>';	
		}
		html +=		'	</tbody>';
		html +=		'</table>';
		return html;
	}
	
	var _getSoftwareRowTemplate = function(record, id){
		var html = '<tr id="software-' + id + '">';
		html += 	'	<td class="software-name">' + record.name + '</td>';
		html +=		'	<td class="software-version">' + record.version + '</td>';
		html +=		'</tr>';
		return html;	
	};
	
	var _getSoftwarePopupTemplate = function(record){
		var html = '<table class="table table-striped table-condensed" style="table-layout:fixed;">';
		html +=		'	<tbody>';
		for(key in record){
			html +=		'<tr>';
			html +=		'	<td style="width:38%;text-align:right;"><strong>' + (key == 'date' ? 'build date' : key.replace('_', ' ')) + '</strong></td>';
			html +=		'	<td>' + record[key] + '</td>';
			html +=		'</tr>';	
		}
		html +=		'	</tbody>';
		html +=		'</table>';
		return html;
	};
	
	var _getCpusRowTemplate = function(record, id){
		var html = '<tr id="cpu-' + id + '">';
		html +=		'	<td class="cpu-id">' + record.core_id + '</td>';
		html += 	'	<td class="cpu-cores">' + record.cpu_cores + '</td>';
		html += 	'	<td class="cpu-name">' + record.model_name + '</td>';
		html +=		'</tr>';
		return html;
	};
	
	var _getCPUPopupTemplate = function(record){
		var html = '<table class="table table-striped table-condensed" style="table-layout:fixed;">';
		html +=		'	<tbody>';
		for(key in record){
			if(key == 'flags' ||
				key == 'model' ||
				key == 'model_name' ||
				key == 'power_management') continue;
			html +=		'<tr>';
			html +=		'	<td style="width:38%;text-align:right;"><strong>' + key.replace('_', ' ') + '</strong></td>';
			html +=		'	<td>' + record[key] + '</td>';
			html +=		'</tr>';	
		}
		html +=		'	</tbody>';
		html +=		'</table>';
		return html;
	};
	
	var _getDomainsRowTemplate = function(record, id){
		var html = '<tr id="domain-' + id + '">';
		html += 	'	<td class="domain-name"><a href="http://' + record.name + '" target="_blank">' + record.name + '</a></td>';
		html +=		'	<td class="domain-size">' + record.size + '</td>';
		html +=		'</tr>';
		return html;
	};
	
	/**
		Utils
	**/	
	var _basicAuthHash = function(user, pass){
		return 'Basic ' + Base64.encode(user + ':' + pass);
	};
	
	var _cleanID = function(string){
		var clean = string.replace(/[^\w\s]/gi, '');
		clean = clean.split(' ').join('-').toLowerCase();
		return clean;
	};
	
	var _updateHTML = function(el, value){
		if(!_valuesMatch(el.html(), value)){
			el.html(value);	
		}
	};
	
	var _valuesMatch = function(value1, value2){
		return value1 == value2;	
	};
	
	var _showLoading = function(){
		if($('#overlay').length){
			$('#overlay').fadeIn(250);	
		}
	};
	
	var _hideLoading = function(){
		if($('#overlay').length){
			$('#overlay').delay(200).fadeOut(250);	
		}
	};
	
	/**
		Public
	**/
	return {
		useEventStream: function(bool){
			_useEventStream = bool;	
		},
		setEndPoint: function(url){
			_endPoint = url;
		},
		getEndPoint: function(){
			return _endPoint;
		},	
		setEventStreamFileName: function(name){
			_eventStreamFileName = name;
		},
		getEventStreamFileName: function(){
			return _eventStreamFileName;
		},
		setLongPollFileName: function(name){
			_longPollFileName = name;
		},
		getLongPollFileName: function(){
			return _longPollFileName;
		},
		setLongPollTimeoutDelay: function(milliseconds){
			_longPollTimoutDelay = milliseconds;
		},
		setBasicUserPass: function(user, pass){
			_basicAuthUsername = user;
			_basicAuthPassword = pass;
		},
		loadData: function(){
			_loadData();	
		},
		stopLoad: function(){
			_stopLoad();	
		},
		getResponseData: function(){
			return _responseData;
		}
	}
}());