/*! v0.1.0 Build Mon Nov 30 2015 14:27:33 GMT+0300 (MSK) */
!function(){var mashup={},define=function(){var t,e,n,r=Array.prototype.slice.call(arguments,0);"string"==typeof r[0]?(n=r[0],t=r[1],e=r[2]):Array.isArray(r[0])&&(t=r[0],e=r[1]);var i=t.reduce(function(t,e){return t.addDependency(e)},tau.mashups);return i=i.addDependency(n+"/config"),i=i.addMashup(function(){var r=Array.prototype.slice.call(arguments,0);if(t.length>0&&1===r.length)throw new Error("Can't properly load dependencies for mashup \""+n+'", mashup is stopped.');return mashup.variables=r[r.length-1],r.length-t.length===2?mashup.config=r[r.length-2]:mashup.config={},Object.freeze&&(Object.freeze(mashup.variables),Object.freeze(mashup.config),Object.freeze(mashup)),e.apply(null,r)})};define("CustomUnitShowRelations",["jQuery","Underscore","tau/configurator"],function(__WEBPACK_EXTERNAL_MODULE_4__,__WEBPACK_EXTERNAL_MODULE_5__,__WEBPACK_EXTERNAL_MODULE_7__){return function(t){function e(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return t[r].call(i.exports,i,i.exports,e),i.loaded=!0,i.exports}var n={};return e.m=t,e.c=n,e.p="",e.p=mashup.variables?mashup.variables.mashupPath:e.p,e(0)}([function(t,e,n){t.exports=n(3)},,,function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}var i=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},o=n(4),a=r(o),u=n(5),s=r(u),l=n(6),d=n(8),c=n(10);n(15);var p=function(t){l.addBusListener("board_plus","initialize",function(e){var n=e.data.viewMode;return t({viewMode:n})}),l.addBusListener("newlist","initialize",function(){return t({viewMode:"newlist"})})},f=function(t){l.addBusListener("board_plus","destroy",function(){return t()}),l.addBusListener("newlist","destroy",function(){return t()})},h=function(t){return l.addBusListener("board.toolbar","boardSettings.ready:last + afterRender:last",function(e,n,r){var i=n.boardSettings.settings,o=r.element;return t(o,i)})},m=function(t){return l.addBusListener("newlist","view.cell.skeleton.built",function(){return t()})},g=function(t){return a["default"](document.body).on("click",".tau-board-unit_type_relations-counter-in-out",t)},v=function(t){l.addBusListener("board_plus","model.zoomLevelChanged",function(){return t()})},y=function(t){l.addBusListener("board_plus","boardSettings.ready",function(){return t()}),l.addBusListener("newlist","boardSettings.ready",function(){return t()})},_=function(t){return a["default"](document).on("click",".i-role-hide-empty-lanes",function(){return t()})},w=function(t){return l.addBusListener("board_plus","view.axis.collapser.executed.before",function(){return t()})},x=function(){var t=!0,e=!1;p(function(){t=!0}),f(function(){t=!1}),g(function(n){if(t){n.stopPropagation(),n.preventDefault();var r=a["default"](n.target).parents(".i-role-card"),i=r[0],o=r.data("entityId"),u=r.data("entityType");if(o){if(e)return c.removeAllDrawn(),void(e=!1);e=!0,a["default"].when(d.getRelationsById(o)).then(function(t){c.removeAllDrawn();var n=c.createSvg();c.drawRelations(t,i),c.highlightCardsByRelations(t,i),c.drawLegend(t,o,u),n.on("click",function(){e=!1,c.removeAllDrawn()})})}}})},b=function(t){var e=s["default"].groupBy(t,function(t){return a["default"](t).data("entityId")}),n=Object.keys(e).filter(function(t){return t.match(/^\d+$/)});a["default"].when(d.getRelationsByIds(n)).then(function(t){var r=t.filter(function(t){return n.indexOf(String(t.entity.id))>=0}).map(function(t,e){return i({index:e},t)}),o=s["default"].groupBy(r,function(t){return t.main.id});Object.keys(o).forEach(function(t){var n=o[t],r=e[t];r.forEach(function(t){c.drawRelations(n,t),c.highlightCardsByRelations(n,t,{outline:!1})})}),c.drawLegend(r)})},R=function(){return a["default"](".i-role-grid .i-role-card").toArray()},C=function(){var t=!1,e="Hide Relations",n="Show Relations",r=void 0,i=function(){t=!1,r&&r.text(n),c.removeAllDrawn()},o=function(){return r=a["default"]('<button class="tau-btn" type="button" style="margin-left: 10px;" />'),r.on("click",function(){t=!t,t?(r.text(e),a["default"].when(R()).then(function(e){c.removeAllDrawn();var i=c.createSvg();b(e),i.on("click",function(){c.removeAllDrawn(),t=!1,r.text(n)})})):i()}),r};h(function(t,e){var n=e.viewMode;"list"!==n&&"timeline"!==n&&(r&&r.remove(),t.find(".tau-board-view-switch").after(o()),i())}),v(i),y(i),_(i),m(i),w(i)};x(),C()},function(t,e){t.exports=__WEBPACK_EXTERNAL_MODULE_4__},function(t,e){t.exports=__WEBPACK_EXTERNAL_MODULE_5__},function(t,e,n){"use strict";var r=n(7),i=r.getBusRegistry(),o=function(t){return function(){t.apply(null,Array.prototype.slice.call(arguments).slice(1))}},a=function(t,e,n,r){var a=o(function(i){var o=i.bus;o.name===t&&o[r?"once":"on"](e,n)}),u=i.addEventListener("create",a);return i.addEventListener("destroy",o(function(r){var i=r.bus;i.name===t&&i.removeListener(e,n,u)})),{remove:function(){i.removeListener("create",a,u),i.getByName(t).then(function(t){t.removeListener(e,n,u)})}}},u=function(t,e,n){return a(t,e,n,!0)};t.exports={addBusListener:a,addBusListenerOnce:u}},function(t,e){t.exports=__WEBPACK_EXTERNAL_MODULE_7__},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function i(t,e){return Object.freeze(Object.defineProperties(t,{raw:{value:Object.freeze(e)}}))}Object.defineProperty(e,"__esModule",{value:!0});var o=i(["","/api/v1/generals/","?\n            include=[MasterRelations[Master,RelationType],SlaveRelations[Slave,RelationType]]&\n            format=json"],["","/api/v1/generals/","?\n            include=[MasterRelations[Master,RelationType],SlaveRelations[Slave,RelationType]]&\n            format=json"]),a=i(["","/api/v1/relations?\n            where=Master.Id in (",")&\n            include=[Slave[Id],Master[Id],RelationType[Name]]&\n            format=json"],["","/api/v1/relations?\n            where=Master.Id in (",")&\n            include=[Slave[Id],Master[Id],RelationType[Name]]&\n            format=json"]),u=n(4),s=r(u),l=n(9),d=r(l),c=n(7),p=r(c),f=function(t){var e=function(t,e,n){return{directionType:n,relationType:{name:t.RelationType.Name},entity:{id:t[e].Id}}};return s["default"].ajax({url:d["default"](o,p["default"].getApplicationPath(),t),contentType:"application/json; charset=utf-8"}).then(function(t){return t.MasterRelations.Items.map(function(t){return e(t,"Master","inbound")}).concat(t.SlaveRelations.Items.map(function(t){return e(t,"Slave","outbound")}))}).fail(function(){return[]})};e.getRelationsById=f;var h=function(t){if(!t.length)return[];var e=function(t,e,n){return{directionType:n,relationType:{name:t.RelationType.Name},entity:{id:t[e].Id},main:{id:t.Master.Id}}};return s["default"].ajax({url:d["default"](a,p["default"].getApplicationPath(),t.join(",")),contentType:"application/json; charset=utf-8"}).then(function(t){return t.Items.map(function(t){return e(t,"Slave","outbound")})}).fail(function(){return[]})};e.getRelationsByIds=h},function(t,e){function n(t){return t.replace(/\n\r?\s*/g,"")}t.exports=function(t){for(var e="",r=0;r<arguments.length;r++)e+=n(t[r])+(arguments[r+1]||"");return e}},function(t,e,n){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var i=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},o=n(4),a=r(o),u=n(5),s=r(u),l=n(11),d=n(12),c=n(13),p=r(c),f=n(14),h=r(f),m=void 0,g=void 0,v=void 0,y=void 0,_=void 0,w={},x=[],b=[{name:"Dependency",style:"#000000"},{name:"Blocker",style:"#bd0010"},{name:"Relation",style:"#aaa"},{name:"Link",style:"#36ab45"},{name:"Duplicate",style:"#ff5400"}],R=function(t){return w[t]||[]},C=function(t){var e=t.style;return e},S=function(t){var e=s["default"].findWhere(b,{name:t.relationType.name});return C(e)},U=function(t){var e=t.name;return e+"_start"},M=function(t){var e=t.name;return e+"_inbound_end"},A=function(t){var e=t.name;return e+"_outbound_end"},T=function(t){var e=t.relationType;return U(e)},E=function(t){var e=t.relationType;return M(e)},L=function(t){var e=t.relationType;return A(e)},k=function(t,e,n){_.addClass("mashupCustomUnitShowRelations-highlighted"),a["default"](t).addClass("mashupCustomUnitShowRelations__highlighted"),a["default"](e).addClass("mashupCustomUnitShowRelations__highlighted"),g.parent().addClass("mashupCustomUnitShowRelations__svg-highlighted"),a["default"](n).css("opacity",1)},j=function(t,e,n){_.removeClass("mashupCustomUnitShowRelations-highlighted"),a["default"](t).removeClass("mashupCustomUnitShowRelations__highlighted"),a["default"](e).removeClass("mashupCustomUnitShowRelations__highlighted"),g.parent().removeClass("mashupCustomUnitShowRelations__svg-highlighted"),a["default"](n).removeAttr("style")},B=function(t,e){var n=arguments.length<=2||void 0===arguments[2]?!1:arguments[2],r=["M"+t.x+","+t.y],i=Math.PI/48*(n?-1:1),o=Math.cos(i),a=Math.sin(i),u={x:(t.x+e.x)/2,y:(t.y+e.y)/2},s={x:(u.x-t.x)*o-(u.y-t.y)*a+t.x,y:(u.x-t.x)*a+(u.y-t.y)*o+t.y},l=s.x+","+s.y;return r=r.concat("C"+l),r=r.concat(l),r.concat(e.x+","+e.y).join(" ")},O=function(t,e,n){var r="http://www.w3.org/2000/svg",i=e.getBoundingClientRect(),o=n.getBoundingClientRect(),u=m[0].getBoundingClientRect(),s=_[0].getBoundingClientRect(),l={x:i.left-u.left,y:i.top-u.top,height:i.height,width:i.width},c={x:o.left-u.left,y:o.top-u.top,height:o.height,width:o.width},p=d.intersectRects(l,c);if("list"===y){var f=50*((t.index||0)+1);"inbound"===t.directionType?(p.start.x=l.x+f,p.end.x=c.x+f):(p.start.x=l.x+s.width-f-50,p.end.x=c.x+s.width-f-50)}var h=B(p.start,p.end,"inbound"===t.directionType),v=S(t),w=document.createElementNS(r,"path");w.setAttribute("class","helperline"),w.setAttributeNS(null,"d",h),w.setAttributeNS(null,"stroke","grey"),w.setAttributeNS(null,"fill","none"),w.setAttributeNS(null,"stroke-width","20"),g[0].appendChild(w);var x=document.createElementNS(r,"path");x.setAttribute("class","line"),x.setAttributeNS(null,"d",h),x.setAttributeNS(null,"stroke",v),x.setAttributeNS(null,"fill","none"),x.setAttributeNS(null,"stroke-width","2"),"inbound"===t.directionType?(x.setAttributeNS(null,"marker-start","url(#"+E(t)+")"),x.setAttributeNS(null,"marker-end","url(#"+T(t)+")")):(x.setAttributeNS(null,"marker-start","url(#"+T(t)+")"),x.setAttributeNS(null,"marker-end","url(#"+L(t)+")")),g[0].appendChild(x);var b=a["default"](w).add(x);b.on("mouseenter",function(){return k(e,n,x)}),b.on("mouseleave",function(){return j(e,n,x)}),b.on("click",function(t){return t.stopPropagation()})},N=function(t){var e=a["default"](t);e.hasClass("tau-selected")&&(e.removeClass("tau-selected"),x=x.concat(e.data("id")))},I=function(){x.forEach(function(t){return _.find(".i-role-card[data-id="+t+"]").addClass("tau-selected")}),x=[]},z=function(t,e,n,r){var i=r.outline,o=a["default"](t);if("timeline"===y){var u=o.parent(".i-role-timeline-card-holder");u.length&&(N(o),o.addClass("mashupCustomUnitShowRelations__related"),o.addClass("mashupCustomUnitShowRelations__"+n),o=u)}N(o),o.addClass("mashupCustomUnitShowRelations__related"),i&&(o.addClass("mashupCustomUnitShowRelations__related-"+n),o.css("outline-color",e))},D=function(t,e){var n=S(t);R(t.entity.id).forEach(function(r){z(r,n,t.directionType,e)})},P=function(t,e){var n=R(t.entity.id);n.forEach(function(n){return O(t,e,n)})},W=function(){_&&(_.removeClass("mashupCustomUnitShowRelations"),_.removeClass("mashupCustomUnitShowRelations-highlighted"),["related","related-inbound","related-outbound","source"].forEach(function(t){var e="mashupCustomUnitShowRelations__"+t;_.find("."+e).removeClass(e)}))},X=function(){g&&(g.remove(),g=null)},H=function(){v&&(v.remove(),v=null)},K=function(t,e){P(t,e)},Y=function(t,e,n){var r=t.filter(function(t){return R(t.entity.id).length}).map(function(t){return t.relationType.name}),i=b.filter(function(t){return r.indexOf(t.name)>=0});v=a["default"](p["default"]({relationTypes:i,showMessageHidden:e&&r.length<t.length,showMessageEmpty:!e&&!r.length,getRelationTypeColor:C})),_.parent().append(v),e&&v.on("click","a",function(){l.getAppConfigurator().then(function(t){t.getEntityViewService().showEntityView({entityId:e,entityType:n})})})};e.drawLegend=Y;var q=function(t){var e=arguments.length<=1||void 0===arguments[1]?null:arguments[1];if("timeline"!==y){var n=t.filter(function(t){return R(t.entity.id).length});"list"===y&&(n=s["default"].groupBy(n,function(t){return t.directionType}),n=s["default"].map(n,function(t){return t.map(function(t,e){return i({index:e},t)})}),n=s["default"].reduce(n,function(t,e){return t.concat(e)},[])),n.forEach(function(t){var n=e||s["default"].first(R(t.main.id));K(t,n)})}};e.drawRelations=q;var V=function(t,e){var n=arguments.length<=2||void 0===arguments[2]?{outline:!0}:arguments[2];_.addClass("mashupCustomUnitShowRelations"),a["default"](e).addClass("mashupCustomUnitShowRelations__source"),N(e),t.forEach(function(t){return D(t,n)})};e.highlightCardsByRelations=V;var G=function(){W(),X(),H(),I()};e.removeAllDrawn=G;var J=function(){_=a["default"](".i-role-grid"),m=_.children("table"),w=s["default"].groupBy(_.find(".i-role-card").toArray(),function(t){return t.getAttribute("data-entity-id")}),y="board",m.length||(m=_.find(".tau-list-level-0"),y="list"),m.length||(m=_.find(".tau-timeline-flow"),y="timeline");var t=m.height(),e=m.width();return g=a["default"](h["default"]({relationTypes:b,width:e,height:t,getRelationTypeColor:C,getRelationTypeMarkerStartId:U,getInboundRelationTypeMarkerEndId:M,getOutboundRelationTypeMarkerEndId:A})),"list"===y?_.find(".i-role-unit-editor-popup-position-within").append(g):"timeline"===y?_.find(".tau-timeline-canvas").append(g):_.append(g),g};e.createSvg=J},function(t,e,n){"use strict";var r=n(7),i=n(4),o=new i.Deferred;r.getGlobalBus().once("configurator.ready",function(t,e){o.resolve(e)});var a=function(){return o.promise()};t.exports={getAppConfigurator:a}},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=function(t,e){var n=t.x1,r=t.x2,i=t.y1,o=t.y2,a=e.x1,u=e.x2,s=e.y1,l=e.y2,d=(i*(l-s)*(r-n)-s*(o-i)*(u-a)+(a-n)*(l-s)*(o-i))/((l-s)*(r-n)-(o-i)*(u-a)),c=(n*(u-a)*(o-i)-a*(r-n)*(l-s)+(s-i)*(u-a)*(r-n))/((u-a)*(o-i)-(r-n)*(l-s));return{x:c,y:d}},r=function(t){return[{x1:t.x,y1:t.y,x2:t.x+t.width,y2:t.y},{x1:t.x+t.width,y1:t.y,x2:t.x+t.width,y2:t.y+t.height},{x1:t.x,y1:t.y+t.height,x2:t.x+t.width,y2:t.y+t.height},{x1:t.x,y1:t.y,x2:t.x,y2:t.y+t.height}]},i=function(t,e,n){var r=t.x>=Math.min(e.x1,e.x2)&&t.x<=Math.max(e.x1,e.x2),i=t.x>=Math.min(n.x1,n.x2)&&t.x<=Math.max(n.x1,n.x2),o=t.y>=Math.min(e.y1,e.y2)&&t.y<=Math.max(e.y1,e.y2),a=t.y>=Math.min(n.y1,n.y2)&&t.y<=Math.max(n.y1,n.y2);return r&&i&&o&&a},o=function(t,e){var o=r(t),a=void 0,u=void 0;return o.forEach(function(t){var r=n(t,e);u=r,i(r,e,t)&&(a=r)}),a||u},a=function(t,e){var n={x1:t.x+t.width/2,y1:t.y+t.height/2,x2:e.x+e.width/2,y2:e.y+e.height/2};return{start:o(t,n),end:o(e,n)}};e.intersectRects=a},function(module,exports){module.exports=function(obj){var __t,__p="";Array.prototype.join;with(obj||{})__p+='<div class="mashupCustomUnitShowRelations-legend">\n\n    ',showMessageHidden&&(__p+='\n\n        <p class="mashupCustomUnitShowRelations-legend__empty">\n            The selected card has related entities that are not represented on this view.\n            <br />Check the related entities in the <a class="mashupCustomUnitShowRelations-legend__link">cards details</a>.\n        </p>\n\n    '),__p+="\n\n    ",showMessageEmpty&&(__p+='\n\n        <p class="mashupCustomUnitShowRelations-legend__empty">\n            There is no any relations for cards represented on this view.\n        </p>\n\n    '),__p+="\n\n    ",relationTypes.length&&(__p+="\n\n        <h3>Arrows</h3>\n        <div>\n            ",relationTypes.forEach(function(t){__p+="\n                ";var e=getRelationTypeColor(t);__p+='\n                <div class="mashupCustomUnitShowRelations-legend__line">\n                    <svg width="38px" height="7px" viewBox="0 0 38 7" version="1.1" xmlns="http://www.w3.org/2000/svg">\n                        <path d="M0.5,3.5 L27.5,3.5" stroke-linecap="square" stroke="'+(null==(__t=e)?"":__t)+'"></path>\n                        <path d="M27.5,3.5 L20.7,0.5 L20.7,6.5 L27.5,3.5 Z" stroke-linecap="square" stroke="'+(null==(__t=e)?"":__t)+'" fill="'+(null==(__t=e)?"":__t)+'"></path>\n                    </svg>\n                    '+(null==(__t=t.name)?"":__t)+"\n                </div>\n            "}),__p+="\n        </div>\n\n    "),__p+="\n\n</div>\n";return __p}},function(module,exports){module.exports=function(obj){var __t,__p="";Array.prototype.join;with(obj||{})__p+='<svg xmlns="http://www.w3.org/2000/svg" class="mashupCustomUnitShowRelations__svg"\n    viewBox="0 0 '+(null==(__t=width)?"":__t)+" "+(null==(__t=height)?"":__t)+'"\n    width="'+(null==(__t=width)?"":__t)+'px" height="'+(null==(__t=height)?"":__t)+'px">\n    <defs>\n        ',relationTypes.forEach(function(t){__p+='\n\n            <marker id="'+(null==(__t=getRelationTypeMarkerStartId(t))?"":__t)+'" markerWidth="7" markerHeight="7" refX="5" refY="5">\n                <circle cx="5" cy="5" r="2" style="stroke: none; fill:'+(null==(__t=getRelationTypeColor(t))?"":__t)+';"/>\n            </marker>\n            <marker id="'+(null==(__t=getOutboundRelationTypeMarkerEndId(t))?"":__t)+'" markerWidth="4" markerHeight="4" orient="auto" refY="2" refX="0">\n                <path d="M0,0 L4,2 0,4" fill="'+(null==(__t=getRelationTypeColor(t))?"":__t)+'"  />\n            </marker>\n            <marker id="'+(null==(__t=getInboundRelationTypeMarkerEndId(t))?"":__t)+'" markerWidth="4" markerHeight="4" orient="auto" refY="2" refX="4">\n                <path d="M0,0 L4,2 0,4" fill="'+(null==(__t=getRelationTypeColor(t))?"":__t)+'" transform="rotate(180 2 2)" />\n            </marker>\n\n        '}),__p+="\n    </defs>\n</svg>\n";return __p}},function(t,e,n){var r=n(16);"string"==typeof r&&(r=[[t.id,r,""]]);n(18)(r,{});r.locals&&(t.exports=r.locals)},function(t,e,n){e=t.exports=n(17)(),e.push([t.id,".mashupCustomUnitShowRelations__svg{position:absolute;top:0;left:0;z-index:9}.mashupCustomUnitShowRelations .i-role-card,.mashupCustomUnitShowRelations .tau-show-more-cards-trigger{opacity:.3;transition:opacity .1s}.mashupCustomUnitShowRelations .tau-list-more .tau-list-more-inner{z-index:8}.mashupCustomUnitShowRelations__related,.mashupCustomUnitShowRelations__source{opacity:1!important;z-index:9;position:relative}.mashupCustomUnitShowRelations__related-inbound,.mashupCustomUnitShowRelations__related-outbound{outline-width:1px!important;outline-style:solid!important}.mashupCustomUnitShowRelations-highlighted .mashupCustomUnitShowRelations__related{opacity:.3!important}.mashupCustomUnitShowRelations-highlighted .mashupCustomUnitShowRelations__highlighted{opacity:1!important}.mashupCustomUnitShowRelations__svg-highlighted path.line{opacity:.3}.mashupCustomUnitShowRelations__svg-highlighted .mashupCustomUnitShowRelations__highlighted{opacity:1!important}.mashupCustomUnitShowRelations__svg .helperline{opacity:0}.mashupCustomUnitShowRelations__svg .line{transition:opacity .1s}.mashupCustomUnitShowRelations-legend{position:absolute;top:0;left:0;z-index:9;background:#fff;font-size:12px;padding:5px 15px 15px;opacity:.7}.mashupCustomUnitShowRelations-legend:hover{opacity:1}.mashupCustomUnitShowRelations-legend h3{font-weight:600;font-size:12px}.mashupCustomUnitShowRelations-legend__line+.mashupCustomUnitShowRelations-legend__line{margin-top:10px}.mashupCustomUnitShowRelations-legend__link{color:#28428b;cursor:pointer}.i-role-grid .tau-board-unit_type_relations-counter-in-out{cursor:pointer!important}",""])},function(t,e){t.exports=function(){var t=[];return t.toString=function(){for(var t=[],e=0;e<this.length;e++){var n=this[e];n[2]?t.push("@media "+n[2]+"{"+n[1]+"}"):t.push(n[1])}return t.join("")},t.i=function(e,n){"string"==typeof e&&(e=[[null,e,""]]);for(var r={},i=0;i<this.length;i++){var o=this[i][0];"number"==typeof o&&(r[o]=!0)}for(i=0;i<e.length;i++){var a=e[i];"number"==typeof a[0]&&r[a[0]]||(n&&!a[2]?a[2]=n:n&&(a[2]="("+a[2]+") and ("+n+")"),t.push(a))}},t}},function(t,e,n){function r(t,e){for(var n=0;n<t.length;n++){var r=t[n],i=c[r.id];if(i){i.refs++;for(var o=0;o<i.parts.length;o++)i.parts[o](r.parts[o]);for(;o<r.parts.length;o++)i.parts.push(u(r.parts[o],e))}else{for(var a=[],o=0;o<r.parts.length;o++)a.push(u(r.parts[o],e));c[r.id]={id:r.id,refs:1,parts:a}}}}function i(t){for(var e=[],n={},r=0;r<t.length;r++){var i=t[r],o=i[0],a=i[1],u=i[2],s=i[3],l={css:a,media:u,sourceMap:s};n[o]?n[o].parts.push(l):e.push(n[o]={id:o,parts:[l]})}return e}function o(){var t=document.createElement("style"),e=h();return t.type="text/css",e.appendChild(t),t}function a(){var t=document.createElement("link"),e=h();return t.rel="stylesheet",e.appendChild(t),t}function u(t,e){var n,r,i;if(e.singleton){var u=g++;n=m||(m=o()),r=s.bind(null,n,u,!1),i=s.bind(null,n,u,!0)}else t.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=a(),r=d.bind(null,n),i=function(){n.parentNode.removeChild(n),n.href&&URL.revokeObjectURL(n.href)}):(n=o(),r=l.bind(null,n),i=function(){n.parentNode.removeChild(n)});return r(t),function(e){if(e){if(e.css===t.css&&e.media===t.media&&e.sourceMap===t.sourceMap)return;r(t=e)}else i()}}function s(t,e,n,r){var i=n?"":r.css;if(t.styleSheet)t.styleSheet.cssText=v(e,i);else{var o=document.createTextNode(i),a=t.childNodes;a[e]&&t.removeChild(a[e]),a.length?t.insertBefore(o,a[e]):t.appendChild(o)}}function l(t,e){var n=e.css,r=e.media;e.sourceMap;if(r&&t.setAttribute("media",r),t.styleSheet)t.styleSheet.cssText=n;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(n))}}function d(t,e){var n=e.css,r=(e.media,e.sourceMap);r&&(n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */");var i=new Blob([n],{type:"text/css"}),o=t.href;t.href=URL.createObjectURL(i),o&&URL.revokeObjectURL(o)}var c={},p=function(t){var e;return function(){return"undefined"==typeof e&&(e=t.apply(this,arguments)),e}},f=p(function(){return/msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())}),h=p(function(){return document.head||document.getElementsByTagName("head")[0]}),m=null,g=0;t.exports=function(t,e){e=e||{},"undefined"==typeof e.singleton&&(e.singleton=f());var n=i(t);return r(n,e),function(t){for(var o=[],a=0;a<n.length;a++){var u=n[a],s=c[u.id];s.refs--,o.push(s)}if(t){var l=i(t);r(l,e)}for(var a=0;a<o.length;a++){var s=o[a];if(0===s.refs){for(var d=0;d<s.parts.length;d++)s.parts[d]();delete c[s.id]}}}};var v=function(){var t=[];return function(e,n){return t[e]=n,t.filter(Boolean).join("\n")}}()}])})}();