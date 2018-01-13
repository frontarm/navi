import {} from './why-another-router.css'

Why another router?
===================

Junctions is a router for React. But of course, [react-router](https://reacttraining.com/react-router/) already exists. So why build another?


A difference in philosophy
--------------------------

Junctions was designed to provide fast, accessible routing for large web applications with publicly accessible content -- for sites like [React Armory](https://reactarmory.com). As a result, Junctions is laser-focused on providing the best routing experience *for the web*.

In comparison, react-router is focused on providing routing *for any React application*. These applications may be web apps, native apps, or even VR apps. As a result, react-router is more limited in its web-focused features, but does provide better support for Android and iPhone apps.


Features
--------

Junctions' focus on the web means that it provides a number of features that the more general react-router doesn't or can't:<sup>*</sup>

<div style={{fontSize: '80%'}}>
<p><strong>*</strong> From the <a href="https://reacttraining.com/react-router/web/guides/code-splitting">react-router docs</a>: <em>"Godspeed those who attempt the server-rendered, code-split apps."</em></p><p>... Junctions provides statically-rendered code-splits out of the box. 🙃</p>
</div>

<table className='features-table'>
<tbody>
<tr>
<th></th>
<th className="junctions">Junctions</th>
<th className="react-router">react-router</th>
</tr>
<tr>
<th>Scroll management</th>
<td className="yes"></td>
<td></td>
</tr>
<tr>
<th>Page title management</th>
<td className="yes"></td>
<td></td>
</tr>
<tr>
<th>Static rendering with code splitting</th>
<td className="yes"></td>
<td></td>
</tr>
<tr>
<th>Ready-made native components</th>
<td></td>
<td className="yes"></td>
</tr>
</tbody>
</table>

Of course, Gatsby already exists. So [what point is there in Junctions building static websites](/why-another-static-site-generator)?
