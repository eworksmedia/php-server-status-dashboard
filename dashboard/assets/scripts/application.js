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
	Setup server endpoints
**/
var servers = [
	{
		name: 'server 1',
		endPoint: 'http://www.domain.com/path/to/server-stats/'
	},{
		name: 'server 2',
		endPoint: 'http://www.domain.com/path/to/server-stats/'
	},{
		name: 'server 3',
		endPoint: 'http://www.domain.com/path/to/server-stats/'
	}
];

$(document).ready(function(e) {
	paint();
	$(window).resize(paint);
	/**
		Fill server switchers with available servers
	**/
	for(var i = 0; i < servers.length; i++){
		$('#server-dropdown').append('<li><a class="server-switcher" data-server="' + servers[i].endPoint + '">' + servers[i].name + '</a></li>');
		$('#start-server').append('<option value="' + servers[i].endPoint + '">' + servers[i].name + '</option>');
	}
	/**
		Setup ServerStatus
	**/
	ServerStatus.useEventStream(false);
	ServerStatus.setLongPollTimeoutDelay(5000);
	ServerStatus.setBasicUserPass('BASIC_AUTH_USERNAME', 'BASIC_AUTH_PASSWORD');
	/**
		Update view to reflect default ServerStatus load settings
	**/
	$('.load-style a[data-load-style="polling"] input').attr('checked', 'checked');
	$('.poll-delay a[data-poll-delay="5000"] input').attr('checked', 'checked');
	/**
		Listen for events to change server
	**/
	$('#start-server').on('change', function(e){
		if($(this).val() == '') return;
		changeServer($("#start-server option:selected").text(), $(this).val());
	});
	$('.server-switcher').each(function(index, element) {
		$(this).click(function(e) {
			if(ServerStatus.getEndPoint() != $(this).attr('data-server')){
				changeServer($(this).html(), $(this).attr('data-server'));
			}
		});
	});
	/**
		Listen for events to change load style settings
	**/
	$('.load-style a').each(function(index, element) {
		$(this).click(function(e) {
			$('.load-style a input').attr('checked', false);
			$('.load-style a[data-load-style="' + $(this).attr('data-load-style') + '"] input').attr('checked', 'checked');
			ServerStatus.stopLoad();
			switch($(this).attr('data-load-style')){
				case 'polling':
					ServerStatus.useEventStream(false);
				break;
				case 'event':
					ServerStatus.useEventStream(true);
				break;
			}
			ServerStatus.loadData();
		});
	});
	$('.poll-delay a').each(function(index, element) {
		$(this).click(function(e) {
			$('.poll-delay a input').attr('checked', false);
			$('.poll-delay a[data-poll-delay="' + $(this).attr('data-poll-delay') + '"] input').attr('checked', 'checked');
			ServerStatus.stopLoad();
			ServerStatus.setLongPollTimeoutDelay(parseInt($(this).attr('data-poll-delay')));
			ServerStatus.loadData();
		});
	});
});

function changeServer(name, endPoint){
	if($('#start-box-container').length){
		$('#start-box-container').delay(500).hide('slow', function(){ $('#start-box-container').remove(); });
	}
	$('#selected-server').html(name);
	ServerStatus.setEndPoint(endPoint);
	ServerStatus.loadData();	
}

function paint(){
	if($(window).height() > $('body').outerHeight(true)){
		$('body').height($(window).height() - parseInt($('body').css('padding-top')));	
	}
}
