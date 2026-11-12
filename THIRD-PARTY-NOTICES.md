<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>オープンソースライセンス (Third Party Licenses) - Nanai Android Mascot</title>
    <style>
        @media (prefers-color-scheme: dark) {
            body {
                background: #1e1e1e;
                color: #e0e0e0;
            }
            a {
                color: #4db8ff;
            }
            .license-text {
                background: #2d2d2d;
                border: 1px solid #444;
            }
        }
        body {
            background: #ffffff;
            color: #333333;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        .intro {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 20px;
        }
        .licenses-overview {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            list-style: none;
            padding: 0;
        }
        .licenses-overview li {
            background-color: rgba(128, 128, 128, 0.1);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        .licenses-list {
            list-style-type: none;
            margin: 0;
            padding: 0;
        }
        .license {
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 1px solid #eee;
        }
        .license:last-child {
            border-bottom: none;
        }
        .license-used-by {
            margin-top: 5px;
            margin-bottom: 15px;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            padding: 0;
            list-style: none;
        }
        .license-text {
            max-height: 250px;
            overflow-y: auto;
            white-space: pre-wrap;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 15px;
            border-radius: 6px;
            font-size: 0.85em;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
        }
        h3 {
            color: #2c3e50;
            margin-bottom: 5px;
            padding-top: 60px; /* anchor offset */
            margin-top: -60px;
        }
        @media (prefers-color-scheme: dark) {
            h3 { color: #8bb9ff; }
            .licenses-overview li { background-color: rgba(255, 255, 255, 0.1); }
            .license { border-bottom: 1px solid #444; }
        }
    </style>
</head>
<body>
    <main class="container">
        <div class="intro">
            <h1>オープンソースライセンス<br><small>Third Party Licenses</small></h1>
            <p>Nanai Android Mascot (Rust Backend) は、以下の素晴らしいオープンソースソフトウェアを利用して構築されています。<br>
            各プロジェクトの開発者の皆様に感謝いたします。</p>
        </div>

        <h2>ライセンス一覧 (Overview):</h2>
        <ul class="licenses-overview">
            <li><a href="#MIT">MIT License</a> (574)</li>
            <li><a href="#Unicode-3.0">Unicode License v3</a> (19)</li>
            <li><a href="#Apache-2.0">Apache License 2.0</a> (11)</li>
            <li><a href="#BSD-3-Clause">BSD 3-Clause &quot;New&quot; or &quot;Revised&quot; License</a> (11)</li>
            <li><a href="#ISC">ISC License</a> (6)</li>
            <li><a href="#BSD-2-Clause">BSD 2-Clause &quot;Simplified&quot; License</a> (5)</li>
            <li><a href="#MPL-2.0">Mozilla Public License 2.0</a> (5)</li>
            <li><a href="#Zlib">zlib License</a> (2)</li>
            <li><a href="#CDLA-Permissive-2.0">Community Data License Agreement Permissive 2.0</a> (1)</li>
            <li><a href="#NCSA">University of Illinois/NCSA Open Source License</a> (1)</li>
        </ul>

        <h2>ライセンス詳細 (All License Texts):</h2>
        <ul class="licenses-list">
            <li class="license">
                <h3 id="Apache-2.0">Apache License 2.0</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/bytecodealliance/target-lexicon" target="_blank" rel="noopener">target-lexicon v0.12.16</a></li>
                </ul>
                <pre class="license-text">
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

   &quot;License&quot; shall mean the terms and conditions for use, reproduction,
   and distribution as defined by Sections 1 through 9 of this document.

   &quot;Licensor&quot; shall mean the copyright owner or entity authorized by
   the copyright owner that is granting the License.

   &quot;Legal Entity&quot; shall mean the union of the acting entity and all
   other entities that control, are controlled by, or are under common
   control with that entity. For the purposes of this definition,
   &quot;control&quot; means (i) the power, direct or indirect, to cause the
   direction or management of such entity, whether by contract or
   otherwise, or (ii) ownership of fifty percent (50%) or more of the
   outstanding shares, or (iii) beneficial ownership of such entity.

   &quot;You&quot; (or &quot;Your&quot;) shall mean an individual or Legal Entity
   exercising permissions granted by this License.

   &quot;Source&quot; form shall mean the preferred form for making modifications,
   including but not limited to software source code, documentation
   source, and configuration files.

   &quot;Object&quot; form shall mean any form resulting from mechanical
   transformation or translation of a Source form, including but
   not limited to compiled object code, generated documentation,
   and conversions to other media types.

   &quot;Work&quot; shall mean the work of authorship, whether in Source or
   Object form, made available under the License, as indicated by a
   copyright notice that is included in or attached to the work
   (an example is provided in the Appendix below).

   &quot;Derivative Works&quot; shall mean any work, whether in Source or Object
   form, that is based on (or derived from) the Work and for which the
   editorial revisions, annotations, elaborations, or other modifications
   represent, as a whole, an original work of authorship. For the purposes
   of this License, Derivative Works shall not include works that remain
   separable from, or merely link (or bind by name) to the interfaces of,
   the Work and Derivative Works thereof.

   &quot;Contribution&quot; shall mean any work of authorship, including
   the original version of the Work and any modifications or additions
   to that Work or Derivative Works thereof, that is intentionally
   submitted to Licensor for inclusion in the Work by the copyright owner
   or by an individual or Legal Entity authorized to submit on behalf of
   the copyright owner. For the purposes of this definition, &quot;submitted&quot;
   means any form of electronic, verbal, or written communication sent
   to the Licensor or its representatives, including but not limited to
   communication on electronic mailing lists, source code control systems,
   and issue tracking systems that are managed by, or on behalf of, the
   Licensor for the purpose of discussing and improving the Work, but
   excluding communication that is conspicuously marked or otherwise
   designated in writing by the copyright owner as &quot;Not a Contribution.&quot;

   &quot;Contributor&quot; shall mean Licensor and any individual or Legal Entity
   on behalf of whom a Contribution has been received by Licensor and
   subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   copyright license to reproduce, prepare Derivative Works of,
   publicly display, publicly perform, sublicense, and distribute the
   Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   (except as stated in this section) patent license to make, have made,
   use, offer to sell, sell, import, and otherwise transfer the Work,
   where such license applies only to those patent claims licensable
   by such Contributor that are necessarily infringed by their
   Contribution(s) alone or by combination of their Contribution(s)
   with the Work to which such Contribution(s) was submitted. If You
   institute patent litigation against any entity (including a
   cross-claim or counterclaim in a lawsuit) alleging that the Work
   or a Contribution incorporated within the Work constitutes direct
   or contributory patent infringement, then any patent licenses
   granted to You under this License for that Work shall terminate
   as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the
   Work or Derivative Works thereof in any medium, with or without
   modifications, and in Source or Object form, provided that You
   meet the following conditions:

   (a) You must give any other recipients of the Work or
   Derivative Works a copy of this License; and

   (b) You must cause any modified files to carry prominent notices
   stating that You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works
   that You distribute, all copyright, patent, trademark, and
   attribution notices from the Source form of the Work,
   excluding those notices that do not pertain to any part of
   the Derivative Works; and

   (d) If the Work includes a &quot;NOTICE&quot; text file as part of its
   distribution, then any Derivative Works that You distribute must
   include a readable copy of the attribution notices contained
   within such NOTICE file, excluding those notices that do not
   pertain to any part of the Derivative Works, in at least one
   of the following places: within a NOTICE text file distributed
   as part of the Derivative Works; within the Source form or
   documentation, if provided along with the Derivative Works; or,
   within a display generated by the Derivative Works, if and
   wherever such third-party notices normally appear. The contents
   of the NOTICE file are for informational purposes only and
   do not modify the License. You may add Your own attribution
   notices within Derivative Works that You distribute, alongside
   or as an addendum to the NOTICE text from the Work, provided
   that such additional attribution notices cannot be construed
   as modifying the License.

   You may add Your own copyright statement to Your modifications and
   may provide additional or different license terms and conditions
   for use, reproduction, or distribution of Your modifications, or
   for any such Derivative Works as a whole, provided Your use,
   reproduction, and distribution of the Work otherwise complies with
   the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise,
   any Contribution intentionally submitted for inclusion in the Work
   by You to the Licensor shall be under the terms and conditions of
   this License, without any additional terms or conditions.
   Notwithstanding the above, nothing herein shall supersede or modify
   the terms of any separate license agreement you may have executed
   with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade
   names, trademarks, service marks, or product names of the Licensor,
   except as required for reasonable and customary use in describing the
   origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or
   agreed to in writing, Licensor provides the Work (and each
   Contributor provides its Contributions) on an &quot;AS IS&quot; BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
   implied, including, without limitation, any warranties or conditions
   of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
   PARTICULAR PURPOSE. You are solely responsible for determining the
   appropriateness of using or redistributing the Work and assume any
   risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory,
   whether in tort (including negligence), contract, or otherwise,
   unless required by applicable law (such as deliberate and grossly
   negligent acts) or agreed to in writing, shall any Contributor be
   liable to You for damages, including any direct, indirect, special,
   incidental, or consequential damages of any character arising as a
   result of this License or out of the use or inability to use the
   Work (including but not limited to damages for loss of goodwill,
   work stoppage, computer failure or malfunction, or any and all
   other commercial damages or losses), even if such Contributor
   has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing
   the Work or Derivative Works thereof, You may choose to offer,
   and charge a fee for, acceptance of support, warranty, indemnity,
   or other liability obligations and/or rights consistent with this
   License. However, in accepting such obligations, You may act only
   on Your own behalf and on Your sole responsibility, not on behalf
   of any other Contributor, and only if You agree to indemnify,
   defend, and hold each Contributor harmless for any liability
   incurred by, or claims asserted against, such Contributor by reason
   of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets &quot;[]&quot;
      replaced with your own identifying information. (Don&#x27;t include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same &quot;printed page&quot; as the copyright notice for easier
      identification within third-party archives.

Copyright [yyyy] [name of copyright owner]

Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


--- LLVM Exceptions to the Apache 2.0 License ----

As an exception, if, as a result of your compiling your source code, portions
of this Software are embedded into an Object form of such source code, you
may redistribute such embedded portions in such Object form without complying
with the conditions of Sections 4(a), 4(b) and 4(d) of the License.

In addition, if you combine or link compiled forms of this Software with
software that is licensed under the GPLv2 (&quot;Combined Software&quot;) and if a
court of competent jurisdiction determines that the patent provision (Section
3), the indemnity provision (Section 9) or other Section of the License
conflicts with the conditions of the GPLv2, you may retroactively and
prospectively choose to deem waived or otherwise exclude such Section(s) of
the License, but only in their entirety and only with respect to the Combined
Software.

</pre>
            </li>
            <li class="license">
                <h3 id="Apache-2.0">Apache License 2.0</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/zopfli-rs/zopfli" target="_blank" rel="noopener">zopfli v0.8.4</a></li>
                </ul>
                <pre class="license-text">                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

   &quot;License&quot; shall mean the terms and conditions for use, reproduction,
   and distribution as defined by Sections 1 through 9 of this document.

   &quot;Licensor&quot; shall mean the copyright owner or entity authorized by
   the copyright owner that is granting the License.

   &quot;Legal Entity&quot; shall mean the union of the acting entity and all
   other entities that control, are controlled by, or are under common
   control with that entity. For the purposes of this definition,
   &quot;control&quot; means (i) the power, direct or indirect, to cause the
   direction or management of such entity, whether by contract or
   otherwise, or (ii) ownership of fifty percent (50%) or more of the
   outstanding shares, or (iii) beneficial ownership of such entity.

   &quot;You&quot; (or &quot;Your&quot;) shall mean an individual or Legal Entity
   exercising permissions granted by this License.

   &quot;Source&quot; form shall mean the preferred form for making modifications,
   including but not limited to software source code, documentation
   source, and configuration files.

   &quot;Object&quot; form shall mean any form resulting from mechanical
   transformation or translation of a Source form, including but
   not limited to compiled object code, generated documentation,
   and conversions to other media types.

   &quot;Work&quot; shall mean the work of authorship, whether in Source or
   Object form, made available under the License, as indicated by a
   copyright notice that is included in or attached to the work
   (an example is provided in the Appendix below).

   &quot;Derivative Works&quot; shall mean any work, whether in Source or Object
   form, that is based on (or derived from) the Work and for which the
   editorial revisions, annotations, elaborations, or other modifications
   represent, as a whole, an original work of authorship. For the purposes
   of this License, Derivative Works shall not include works that remain
   separable from, or merely link (or bind by name) to the interfaces of,
   the Work and Derivative Works thereof.

   &quot;Contribution&quot; shall mean any work of authorship, including
   the original version of the Work and any modifications or additions
   to that Work or Derivative Works thereof, that is intentionally
   submitted to Licensor for inclusion in the Work by the copyright owner
   or by an individual or Legal Entity authorized to submit on behalf of
   the copyright owner. For the purposes of this definition, &quot;submitted&quot;
   means any form of electronic, verbal, or written communication sent
   to the Licensor or its representatives, including but not limited to
   communication on electronic mailing lists, source code control systems,
   and issue tracking systems that are managed by, or on behalf of, the
   Licensor for the purpose of discussing and improving the Work, but
   excluding communication that is conspicuously marked or otherwise
   designated in writing by the copyright owner as &quot;Not a Contribution.&quot;

   &quot;Contributor&quot; shall mean Licensor and any individual or Legal Entity
   on behalf of whom a Contribution has been received by Licensor and
   subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   copyright license to reproduce, prepare Derivative Works of,
   publicly display, publicly perform, sublicense, and distribute the
   Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   (except as stated in this section) patent license to make, have made,
   use, offer to sell, sell, import, and otherwise transfer the Work,
   where such license applies only to those patent claims licensable
   by such Contributor that are necessarily infringed by their
   Contribution(s) alone or by combination of their Contribution(s)
   with the Work to which such Contribution(s) was submitted. If You
   institute patent litigation against any entity (including a
   cross-claim or counterclaim in a lawsuit) alleging that the Work
   or a Contribution incorporated within the Work constitutes direct
   or contributory patent infringement, then any patent licenses
   granted to You under this License for that Work shall terminate
   as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the
   Work or Derivative Works thereof in any medium, with or without
   modifications, and in Source or Object form, provided that You
   meet the following conditions:

   (a) You must give any other recipients of the Work or
   Derivative Works a copy of this License; and

   (b) You must cause any modified files to carry prominent notices
   stating that You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works
   that You distribute, all copyright, patent, trademark, and
   attribution notices from the Source form of the Work,
   excluding those notices that do not pertain to any part of
   the Derivative Works; and

   (d) If the Work includes a &quot;NOTICE&quot; text file as part of its
   distribution, then any Derivative Works that You distribute must
   include a readable copy of the attribution notices contained
   within such NOTICE file, excluding those notices that do not
   pertain to any part of the Derivative Works, in at least one
   of the following places: within a NOTICE text file distributed
   as part of the Derivative Works; within the Source form or
   documentation, if provided along with the Derivative Works; or,
   within a display generated by the Derivative Works, if and
   wherever such third-party notices normally appear. The contents
   of the NOTICE file are for informational purposes only and
   do not modify the License. You may add Your own attribution
   notices within Derivative Works that You distribute, alongside
   or as an addendum to the NOTICE text from the Work, provided
   that such additional attribution notices cannot be construed
   as modifying the License.

   You may add Your own copyright statement to Your modifications and
   may provide additional or different license terms and conditions
   for use, reproduction, or distribution of Your modifications, or
   for any such Derivative Works as a whole, provided Your use,
   reproduction, and distribution of the Work otherwise complies with
   the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise,
   any Contribution intentionally submitted for inclusion in the Work
   by You to the Licensor shall be under the terms and conditions of
   this License, without any additional terms or conditions.
   Notwithstanding the above, nothing herein shall supersede or modify
   the terms of any separate license agreement you may have executed
   with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade
   names, trademarks, service marks, or product names of the Licensor,
   except as required for reasonable and customary use in describing the
   origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or
   agreed to in writing, Licensor provides the Work (and each
   Contributor provides its Contributions) on an &quot;AS IS&quot; BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
   implied, including, without limitation, any warranties or conditions
   of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
   PARTICULAR PURPOSE. You are solely responsible for determining the
   appropriateness of using or redistributing the Work and assume any
   risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory,
   whether in tort (including negligence), contract, or otherwise,
   unless required by applicable law (such as deliberate and grossly
   negligent acts) or agreed to in writing, shall any Contributor be
   liable to You for damages, including any direct, indirect, special,
   incidental, or consequential damages of any character arising as a
   result of this License or out of the use or inability to use the
   Work (including but not limited to damages for loss of goodwill,
   work stoppage, computer failure or malfunction, or any and all
   other commercial damages or losses), even if such Contributor
   has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing
   the Work or Derivative Works thereof, You may choose to offer,
   and charge a fee for, acceptance of support, warranty, indemnity,
   or other liability obligations and/or rights consistent with this
   License. However, in accepting such obligations, You may act only
   on Your own behalf and on Your sole responsibility, not on behalf
   of any other Contributor, and only if You agree to indemnify,
   defend, and hold each Contributor harmless for any liability
   incurred by, or claims asserted against, such Contributor by reason
   of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets &quot;[]&quot;
      replaced with your own identifying information. (Don&#x27;t include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same &quot;printed page&quot; as the copyright notice for easier
      identification within third-party archives.

Copyright 2011 Google Inc.

Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>
</li>
<li class="license">
<h3 id="Apache-2.0">Apache License 2.0</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/awxkee/moxcms.git" target="_blank" rel="noopener">moxcms v0.8.1</a></li>
<li><a href="https://github.com/awxkee/pxfm" target="_blank" rel="noopener">pxfm v0.1.30</a></li>
</ul>
<pre class="license-text"> Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

   &quot;License&quot; shall mean the terms and conditions for use, reproduction,
   and distribution as defined by Sections 1 through 9 of this document.

   &quot;Licensor&quot; shall mean the copyright owner or entity authorized by
   the copyright owner that is granting the License.

   &quot;Legal Entity&quot; shall mean the union of the acting entity and all
   other entities that control, are controlled by, or are under common
   control with that entity. For the purposes of this definition,
   &quot;control&quot; means (i) the power, direct or indirect, to cause the
   direction or management of such entity, whether by contract or
   otherwise, or (ii) ownership of fifty percent (50%) or more of the
   outstanding shares, or (iii) beneficial ownership of such entity.

   &quot;You&quot; (or &quot;Your&quot;) shall mean an individual or Legal Entity
   exercising permissions granted by this License.

   &quot;Source&quot; form shall mean the preferred form for making modifications,
   including but not limited to software source code, documentation
   source, and configuration files.

   &quot;Object&quot; form shall mean any form resulting from mechanical
   transformation or translation of a Source form, including but
   not limited to compiled object code, generated documentation,
   and conversions to other media types.

   &quot;Work&quot; shall mean the work of authorship, whether in Source or
   Object form, made available under the License, as indicated by a
   copyright notice that is included in or attached to the work
   (an example is provided in the Appendix below).

   &quot;Derivative Works&quot; shall mean any work, whether in Source or Object
   form, that is based on (or derived from) the Work and for which the
   editorial revisions, annotations, elaborations, or other modifications
   represent, as a whole, an original work of authorship. For the purposes
   of this License, Derivative Works shall not include works that remain
   separable from, or merely link (or bind by name) to the interfaces of,
   the Work and Derivative Works thereof.

   &quot;Contribution&quot; shall mean any work of authorship, including
   the original version of the Work and any modifications or additions
   to that Work or Derivative Works thereof, that is intentionally
   submitted to Licensor for inclusion in the Work by the copyright owner
   or by an individual or Legal Entity authorized to submit on behalf of
   the copyright owner. For the purposes of this definition, &quot;submitted&quot;
   means any form of electronic, verbal, or written communication sent
   to the Licensor or its representatives, including but not limited to
   communication on electronic mailing lists, source code control systems,
   and issue tracking systems that are managed by, or on behalf of, the
   Licensor for the purpose of discussing and improving the Work, but
   excluding communication that is conspicuously marked or otherwise
   designated in writing by the copyright owner as &quot;Not a Contribution.&quot;

   &quot;Contributor&quot; shall mean Licensor and any individual or Legal Entity
   on behalf of whom a Contribution has been received by Licensor and
   subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   copyright license to reproduce, prepare Derivative Works of,
   publicly display, publicly perform, sublicense, and distribute the
   Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   (except as stated in this section) patent license to make, have made,
   use, offer to sell, sell, import, and otherwise transfer the Work,
   where such license applies only to those patent claims licensable
   by such Contributor that are necessarily infringed by their
   Contribution(s) alone or by combination of their Contribution(s)
   with the Work to which such Contribution(s) was submitted. If You
   institute patent litigation against any entity (including a
   cross-claim or counterclaim in a lawsuit) alleging that the Work
   or a Contribution incorporated within the Work constitutes direct
   or contributory patent infringement, then any patent licenses
   granted to You under this License for that Work shall terminate
   as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the
   Work or Derivative Works thereof in any medium, with or without
   modifications, and in Source or Object form, provided that You
   meet the following conditions:

   (a) You must give any other recipients of the Work or
   Derivative Works a copy of this License; and

   (b) You must cause any modified files to carry prominent notices
   stating that You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works
   that You distribute, all copyright, patent, trademark, and
   attribution notices from the Source form of the Work,
   excluding those notices that do not pertain to any part of
   the Derivative Works; and

   (d) If the Work includes a &quot;NOTICE&quot; text file as part of its
   distribution, then any Derivative Works that You distribute must
   include a readable copy of the attribution notices contained
   within such NOTICE file, excluding those notices that do not
   pertain to any part of the Derivative Works, in at least one
   of the following places: within a NOTICE text file distributed
   as part of the Derivative Works; within the Source form or
   documentation, if provided along with the Derivative Works; or,
   within a display generated by the Derivative Works, if and
   wherever such third-party notices normally appear. The contents
   of the NOTICE file are for informational purposes only and
   do not modify the License. You may add Your own attribution
   notices within Derivative Works that You distribute, alongside
   or as an addendum to the NOTICE text from the Work, provided
   that such additional attribution notices cannot be construed
   as modifying the License.

   You may add Your own copyright statement to Your modifications and
   may provide additional or different license terms and conditions
   for use, reproduction, or distribution of Your modifications, or
   for any such Derivative Works as a whole, provided Your use,
   reproduction, and distribution of the Work otherwise complies with
   the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise,
   any Contribution intentionally submitted for inclusion in the Work
   by You to the Licensor shall be under the terms and conditions of
   this License, without any additional terms or conditions.
   Notwithstanding the above, nothing herein shall supersede or modify
   the terms of any separate license agreement you may have executed
   with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade
   names, trademarks, service marks, or product names of the Licensor,
   except as required for reasonable and customary use in describing the
   origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or
   agreed to in writing, Licensor provides the Work (and each
   Contributor provides its Contributions) on an &quot;AS IS&quot; BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
   implied, including, without limitation, any warranties or conditions
   of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
   PARTICULAR PURPOSE. You are solely responsible for determining the
   appropriateness of using or redistributing the Work and assume any
   risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory,
   whether in tort (including negligence), contract, or otherwise,
   unless required by applicable law (such as deliberate and grossly
   negligent acts) or agreed to in writing, shall any Contributor be
   liable to You for damages, including any direct, indirect, special,
   incidental, or consequential damages of any character arising as a
   result of this License or out of the use or inability to use the
   Work (including but not limited to damages for loss of goodwill,
   work stoppage, computer failure or malfunction, or any and all
   other commercial damages or losses), even if such Contributor
   has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing
   the Work or Derivative Works thereof, You may choose to offer,
   and charge a fee for, acceptance of support, warranty, indemnity,
   or other liability obligations and/or rights consistent with this
   License. However, in accepting such obligations, You may act only
   on Your own behalf and on Your sole responsibility, not on behalf
   of any other Contributor, and only if You agree to indemnify,
   defend, and hold each Contributor harmless for any liability
   incurred by, or claims asserted against, such Contributor by reason
   of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets &quot;[]&quot;
      replaced with your own identifying information. (Don&#x27;t include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same &quot;printed page&quot; as the copyright notice for easier
      identification within third-party archives.

Copyright 2024 Radzivon Bartoshyk

Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>
</li>
<li class="license">
<h3 id="Apache-2.0">Apache License 2.0</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/kornelski/imgref" target="_blank" rel="noopener">imgref v1.12.3</a></li>
</ul>
<pre class="license-text"> Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

   &quot;License&quot; shall mean the terms and conditions for use, reproduction,
   and distribution as defined by Sections 1 through 9 of this document.

   &quot;Licensor&quot; shall mean the copyright owner or entity authorized by
   the copyright owner that is granting the License.

   &quot;Legal Entity&quot; shall mean the union of the acting entity and all
   other entities that control, are controlled by, or are under common
   control with that entity. For the purposes of this definition,
   &quot;control&quot; means (i) the power, direct or indirect, to cause the
   direction or management of such entity, whether by contract or
   otherwise, or (ii) ownership of fifty percent (50%) or more of the
   outstanding shares, or (iii) beneficial ownership of such entity.

   &quot;You&quot; (or &quot;Your&quot;) shall mean an individual or Legal Entity
   exercising permissions granted by this License.

   &quot;Source&quot; form shall mean the preferred form for making modifications,
   including but not limited to software source code, documentation
   source, and configuration files.

   &quot;Object&quot; form shall mean any form resulting from mechanical
   transformation or translation of a Source form, including but
   not limited to compiled object code, generated documentation,
   and conversions to other media types.

   &quot;Work&quot; shall mean the work of authorship, whether in Source or
   Object form, made available under the License, as indicated by a
   copyright notice that is included in or attached to the work
   (an example is provided in the Appendix below).

   &quot;Derivative Works&quot; shall mean any work, whether in Source or Object
   form, that is based on (or derived from) the Work and for which the
   editorial revisions, annotations, elaborations, or other modifications
   represent, as a whole, an original work of authorship. For the purposes
   of this License, Derivative Works shall not include works that remain
   separable from, or merely link (or bind by name) to the interfaces of,
   the Work and Derivative Works thereof.

   &quot;Contribution&quot; shall mean any work of authorship, including
   the original version of the Work and any modifications or additions
   to that Work or Derivative Works thereof, that is intentionally
   submitted to Licensor for inclusion in the Work by the copyright owner
   or by an individual or Legal Entity authorized to submit on behalf of
   the copyright owner. For the purposes of this definition, &quot;submitted&quot;
   means any form of electronic, verbal, or written communication sent
   to the Licensor or its representatives, including but not limited to
   communication on electronic mailing lists, source code control systems,
   and issue tracking systems that are managed by, or on behalf of, the
   Licensor for the purpose of discussing and improving the Work, but
   excluding communication that is conspicuously marked or otherwise
   designated in writing by the copyright owner as &quot;Not a Contribution.&quot;

   &quot;Contributor&quot; shall mean Licensor and any individual or Legal Entity
   on behalf of whom a Contribution has been received by Licensor and
   subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   copyright license to reproduce, prepare Derivative Works of,
   publicly display, publicly perform, sublicense, and distribute the
   Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   (except as stated in this section) patent license to make, have made,
   use, offer to sell, sell, import, and otherwise transfer the Work,
   where such license applies only to those patent claims licensable
   by such Contributor that are necessarily infringed by their
   Contribution(s) alone or by combination of their Contribution(s)
   with the Work to which such Contribution(s) was submitted. If You
   institute patent litigation against any entity (including a
   cross-claim or counterclaim in a lawsuit) alleging that the Work
   or a Contribution incorporated within the Work constitutes direct
   or contributory patent infringement, then any patent licenses
   granted to You under this License for that Work shall terminate
   as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the
   Work or Derivative Works thereof in any medium, with or without
   modifications, and in Source or Object form, provided that You
   meet the following conditions:

   (a) You must give any other recipients of the Work or
   Derivative Works a copy of this License; and

   (b) You must cause any modified files to carry prominent notices
   stating that You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works
   that You distribute, all copyright, patent, trademark, and
   attribution notices from the Source form of the Work,
   excluding those notices that do not pertain to any part of
   the Derivative Works; and

   (d) If the Work includes a &quot;NOTICE&quot; text file as part of its
   distribution, then any Derivative Works that You distribute must
   include a readable copy of the attribution notices contained
   within such NOTICE file, excluding those notices that do not
   pertain to any part of the Derivative Works, in at least one
   of the following places: within a NOTICE text file distributed
   as part of the Derivative Works; within the Source form or
   documentation, if provided along with the Derivative Works; or,
   within a display generated by the Derivative Works, if and
   wherever such third-party notices normally appear. The contents
   of the NOTICE file are for informational purposes only and
   do not modify the License. You may add Your own attribution
   notices within Derivative Works that You distribute, alongside
   or as an addendum to the NOTICE text from the Work, provided
   that such additional attribution notices cannot be construed
   as modifying the License.

   You may add Your own copyright statement to Your modifications and
   may provide additional or different license terms and conditions
   for use, reproduction, or distribution of Your modifications, or
   for any such Derivative Works as a whole, provided Your use,
   reproduction, and distribution of the Work otherwise complies with
   the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise,
   any Contribution intentionally submitted for inclusion in the Work
   by You to the Licensor shall be under the terms and conditions of
   this License, without any additional terms or conditions.
   Notwithstanding the above, nothing herein shall supersede or modify
   the terms of any separate license agreement you may have executed
   with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade
   names, trademarks, service marks, or product names of the Licensor,
   except as required for reasonable and customary use in describing the
   origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or
   agreed to in writing, Licensor provides the Work (and each
   Contributor provides its Contributions) on an &quot;AS IS&quot; BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
   implied, including, without limitation, any warranties or conditions
   of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
   PARTICULAR PURPOSE. You are solely responsible for determining the
   appropriateness of using or redistributing the Work and assume any
   risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory,
   whether in tort (including negligence), contract, or otherwise,
   unless required by applicable law (such as deliberate and grossly
   negligent acts) or agreed to in writing, shall any Contributor be
   liable to You for damages, including any direct, indirect, special,
   incidental, or consequential damages of any character arising as a
   result of this License or out of the use or inability to use the
   Work (including but not limited to damages for loss of goodwill,
   work stoppage, computer failure or malfunction, or any and all
   other commercial damages or losses), even if such Contributor
   has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing
   the Work or Derivative Works thereof, You may choose to offer,
   and charge a fee for, acceptance of support, warranty, indemnity,
   or other liability obligations and/or rights consistent with this
   License. However, in accepting such obligations, You may act only
   on Your own behalf and on Your sole responsibility, not on behalf
   of any other Contributor, and only if You agree to indemnify,
   defend, and hold each Contributor harmless for any liability
   incurred by, or claims asserted against, such Contributor by reason
   of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets &quot;[]&quot;
      replaced with your own identifying information. (Don&#x27;t include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same &quot;printed page&quot; as the copyright notice for easier
      identification within third-party archives.

Copyright [yyyy] [name of copyright owner]

Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>
</li>
<li class="license">
<h3 id="Apache-2.0">Apache License 2.0</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tauri-apps/tao" target="_blank" rel="noopener">tao v0.37.2</a></li>
</ul>
<pre class="license-text">Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

   &quot;License&quot; shall mean the terms and conditions for use, reproduction,
   and distribution as defined by Sections 1 through 9 of this document.

   &quot;Licensor&quot; shall mean the copyright owner or entity authorized by
   the copyright owner that is granting the License.

   &quot;Legal Entity&quot; shall mean the union of the acting entity and all
   other entities that control, are controlled by, or are under common
   control with that entity. For the purposes of this definition,
   &quot;control&quot; means (i) the power, direct or indirect, to cause the
   direction or management of such entity, whether by contract or
   otherwise, or (ii) ownership of fifty percent (50%) or more of the
   outstanding shares, or (iii) beneficial ownership of such entity.

   &quot;You&quot; (or &quot;Your&quot;) shall mean an individual or Legal Entity
   exercising permissions granted by this License.

   &quot;Source&quot; form shall mean the preferred form for making modifications,
   including but not limited to software source code, documentation
   source, and configuration files.

   &quot;Object&quot; form shall mean any form resulting from mechanical
   transformation or translation of a Source form, including but
   not limited to compiled object code, generated documentation,
   and conversions to other media types.

   &quot;Work&quot; shall mean the work of authorship, whether in Source or
   Object form, made available under the License, as indicated by a
   copyright notice that is included in or attached to the work
   (an example is provided in the Appendix below).

   &quot;Derivative Works&quot; shall mean any work, whether in Source or Object
   form, that is based on (or derived from) the Work and for which the
   editorial revisions, annotations, elaborations, or other modifications
   represent, as a whole, an original work of authorship. For the purposes
   of this License, Derivative Works shall not include works that remain
   separable from, or merely link (or bind by name) to the interfaces of,
   the Work and Derivative Works thereof.

   &quot;Contribution&quot; shall mean any work of authorship, including
   the original version of the Work and any modifications or additions
   to that Work or Derivative Works thereof, that is intentionally
   submitted to Licensor for inclusion in the Work by the copyright owner
   or by an individual or Legal Entity authorized to submit on behalf of
   the copyright owner. For the purposes of this definition, &quot;submitted&quot;
   means any form of electronic, verbal, or written communication sent
   to the Licensor or its representatives, including but not limited to
   communication on electronic mailing lists, source code control systems,
   and issue tracking systems that are managed by, or on behalf of, the
   Licensor for the purpose of discussing and improving the Work, but
   excluding communication that is conspicuously marked or otherwise
   designated in writing by the copyright owner as &quot;Not a Contribution.&quot;

   &quot;Contributor&quot; shall mean Licensor and any individual or Legal Entity
   on behalf of whom a Contribution has been received by Licensor and
   subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   copyright license to reproduce, prepare Derivative Works of,
   publicly display, publicly perform, sublicense, and distribute the
   Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   (except as stated in this section) patent license to make, have made,
   use, offer to sell, sell, import, and otherwise transfer the Work,
   where such license applies only to those patent claims licensable
   by such Contributor that are necessarily infringed by their
   Contribution(s) alone or by combination of their Contribution(s)
   with the Work to which such Contribution(s) was submitted. If You
   institute patent litigation against any entity (including a
   cross-claim or counterclaim in a lawsuit) alleging that the Work
   or a Contribution incorporated within the Work constitutes direct
   or contributory patent infringement, then any patent licenses
   granted to You under this License for that Work shall terminate
   as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the
   Work or Derivative Works thereof in any medium, with or without
   modifications, and in Source or Object form, provided that You
   meet the following conditions:

   (a) You must give any other recipients of the Work or
   Derivative Works a copy of this License; and

   (b) You must cause any modified files to carry prominent notices
   stating that You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works
   that You distribute, all copyright, patent, trademark, and
   attribution notices from the Source form of the Work,
   excluding those notices that do not pertain to any part of
   the Derivative Works; and

   (d) If the Work includes a &quot;NOTICE&quot; text file as part of its
   distribution, then any Derivative Works that You distribute must
   include a readable copy of the attribution notices contained
   within such NOTICE file, excluding those notices that do not
   pertain to any part of the Derivative Works, in at least one
   of the following places: within a NOTICE text file distributed
   as part of the Derivative Works; within the Source form or
   documentation, if provided along with the Derivative Works; or,
   within a display generated by the Derivative Works, if and
   wherever such third-party notices normally appear. The contents
   of the NOTICE file are for informational purposes only and
   do not modify the License. You may add Your own attribution
   notices within Derivative Works that You distribute, alongside
   or as an addendum to the NOTICE text from the Work, provided
   that such additional attribution notices cannot be construed
   as modifying the License.

   You may add Your own copyright statement to Your modifications and
   may provide additional or different license terms and conditions
   for use, reproduction, or distribution of Your modifications, or
   for any such Derivative Works as a whole, provided Your use,
   reproduction, and distribution of the Work otherwise complies with
   the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise,
   any Contribution intentionally submitted for inclusion in the Work
   by You to the Licensor shall be under the terms and conditions of
   this License, without any additional terms or conditions.
   Notwithstanding the above, nothing herein shall supersede or modify
   the terms of any separate license agreement you may have executed
   with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade
   names, trademarks, service marks, or product names of the Licensor,
   except as required for reasonable and customary use in describing the
   origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or
   agreed to in writing, Licensor provides the Work (and each
   Contributor provides its Contributions) on an &quot;AS IS&quot; BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
   implied, including, without limitation, any warranties or conditions
   of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
   PARTICULAR PURPOSE. You are solely responsible for determining the
   appropriateness of using or redistributing the Work and assume any
   risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory,
   whether in tort (including negligence), contract, or otherwise,
   unless required by applicable law (such as deliberate and grossly
   negligent acts) or agreed to in writing, shall any Contributor be
   liable to You for damages, including any direct, indirect, special,
   incidental, or consequential damages of any character arising as a
   result of this License or out of the use or inability to use the
   Work (including but not limited to damages for loss of goodwill,
   work stoppage, computer failure or malfunction, or any and all
   other commercial damages or losses), even if such Contributor
   has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing
   the Work or Derivative Works thereof, You may choose to offer,
   and charge a fee for, acceptance of support, warranty, indemnity,
   or other liability obligations and/or rights consistent with this
   License. However, in accepting such obligations, You may act only
   on Your own behalf and on Your sole responsibility, not on behalf
   of any other Contributor, and only if You agree to indemnify,
   defend, and hold each Contributor harmless for any liability
   incurred by, or claims asserted against, such Contributor by reason
   of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets &quot;{}&quot;
      replaced with your own identifying information. (Don&#x27;t include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same &quot;printed page&quot; as the copyright notice for easier
      identification within third-party archives.

Copyright {yyyy} {name of copyright owner}

Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.</pre>
</li>
<li class="license">
<h3 id="Apache-2.0">Apache License 2.0</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/aws/aws-lc-rs" target="_blank" rel="noopener">aws-lc-sys v0.47.0</a></li>
<li><a href="https://codeberg.org/cesarb/constant_time_eq" target="_blank" rel="noopener">constant_time_eq v0.6.1</a></li>
<li><a href="https://gitlab.com/kornelski/dunce" target="_blank" rel="noopener">dunce v1.0.5</a></li>
<li><a href="https://github.com/Actyx/sync_wrapper" target="_blank" rel="noopener">sync_wrapper v1.0.2</a></li>
</ul>
<pre class="license-text">Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

&quot;License&quot; shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.

&quot;Licensor&quot; shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.

&quot;Legal Entity&quot; shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity. For the purposes of this definition, &quot;control&quot; means (i) the power, direct or indirect, to cause the direction or management of such entity, whether by contract or otherwise, or (ii) ownership of fifty percent (50%) or more of the outstanding shares, or (iii) beneficial ownership of such entity.

&quot;You&quot; (or &quot;Your&quot;) shall mean an individual or Legal Entity exercising permissions granted by this License.

&quot;Source&quot; form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.

&quot;Object&quot; form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not limited to compiled object code, generated documentation, and conversions to other media types.

&quot;Work&quot; shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work (an example is provided in the Appendix below).

&quot;Derivative Works&quot; shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship. For the purposes of this License, Derivative Works shall not include works that remain separable from, or merely link (or bind by name) to the interfaces of, the Work and Derivative Works thereof.

&quot;Contribution&quot; shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work or Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner. For the purposes of this definition, &quot;submitted&quot; means any form of electronic, verbal, or written communication sent to the Licensor or its representatives, including but not limited to communication on electronic mailing lists, source code control systems, and issue tracking systems that are managed by, or on behalf of, the Licensor for the purpose of discussing and improving the Work, but excluding communication that is conspicuously marked or otherwise designated in writing by the copyright owner as &quot;Not a Contribution.&quot;

&quot;Contributor&quot; shall mean Licensor and any individual or Legal Entity on behalf of whom a Contribution has been received by Licensor and subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work, where such license applies only to those patent claims licensable by such Contributor that are necessarily infringed by their Contribution(s) alone or by combination of their Contribution(s) with the Work to which such Contribution(s) was submitted. If You institute patent litigation against any entity (including a cross-claim or counterclaim in a lawsuit) alleging that the Work or a Contribution incorporated within the Work constitutes direct or contributory patent infringement, then any patent licenses granted to You under this License for that Work shall terminate as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, and in Source or Object form, provided that You meet the following conditions:

   (a) You must give any other recipients of the Work or Derivative Works a copy of this License; and

   (b) You must cause any modified files to carry prominent notices stating that You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works that You distribute, all copyright, patent, trademark, and attribution notices from the Source form of the Work, excluding those notices that do not pertain to any part of the Derivative Works; and

   (d) If the Work includes a &quot;NOTICE&quot; text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices contained within such NOTICE file, excluding those notices that do not pertain to any part of the Derivative Works, in at least one of the following places: within a NOTICE text file distributed as part of the Derivative Works; within the Source form or documentation, if provided along with the Derivative Works; or, within a display generated by the Derivative Works, if and wherever such third-party notices normally appear. The contents of the NOTICE file are for informational purposes only and do not modify the License. You may add Your own attribution notices within Derivative Works that You distribute, alongside or as an addendum to the NOTICE text from the Work, provided that such additional attribution notices cannot be construed as modifying the License.

   You may add Your own copyright statement to Your modifications and may provide additional or different license terms and conditions for use, reproduction, or distribution of Your modifications, or for any such Derivative Works as a whole, provided Your use, reproduction, and distribution of the Work otherwise complies with the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise, any Contribution intentionally submitted for inclusion in the Work by You to the Licensor shall be under the terms and conditions of this License, without any additional terms or conditions. Notwithstanding the above, nothing herein shall supersede or modify the terms of any separate license agreement you may have executed with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an &quot;AS IS&quot; BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work and assume any risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory, whether in tort (including negligence), contract, or otherwise, unless required by applicable law (such as deliberate and grossly negligent acts) or agreed to in writing, shall any Contributor be liable to You for damages, including any direct, indirect, special, incidental, or consequential damages of any character arising as a result of this License or out of the use or inability to use the Work (including but not limited to damages for loss of goodwill, work stoppage, computer failure or malfunction, or any and all other commercial damages or losses), even if such Contributor has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing the Work or Derivative Works thereof, You may choose to offer, and charge a fee for, acceptance of support, warranty, indemnity, or other liability obligations and/or rights consistent with this License. However, in accepting such obligations, You may act only on Your own behalf and on Your sole responsibility, not on behalf of any other Contributor, and only if You agree to indemnify, defend, and hold each Contributor harmless for any liability incurred by, or claims asserted against, such Contributor by reason of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

To apply the Apache License to your work, attach the following boilerplate notice, with the fields enclosed by brackets &quot;[]&quot; replaced with your own identifying information. (Don&#x27;t include the brackets!) The text should be enclosed in the appropriate comment syntax for the file format. We also recommend that a file or class name and description of purpose be included on the same &quot;printed page&quot; as the copyright notice for easier identification within third-party archives.

Copyright [yyyy] [name of copyright owner]

Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>
</li>
<li class="license">
<h3 id="Apache-2.0">Apache License 2.0</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-windowing/winit" target="_blank" rel="noopener">dpi v0.1.2</a></li>
</ul>
<pre class="license-text">Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

   &quot;License&quot; shall mean the terms and conditions for use, reproduction,
   and distribution as defined by Sections 1 through 9 of this document.

   &quot;Licensor&quot; shall mean the copyright owner or entity authorized by
   the copyright owner that is granting the License.

   &quot;Legal Entity&quot; shall mean the union of the acting entity and all
   other entities that control, are controlled by, or are under common
   control with that entity. For the purposes of this definition,
   &quot;control&quot; means (i) the power, direct or indirect, to cause the
   direction or management of such entity, whether by contract or
   otherwise, or (ii) ownership of fifty percent (50%) or more of the
   outstanding shares, or (iii) beneficial ownership of such entity.

   &quot;You&quot; (or &quot;Your&quot;) shall mean an individual or Legal Entity
   exercising permissions granted by this License.

   &quot;Source&quot; form shall mean the preferred form for making modifications,
   including but not limited to software source code, documentation
   source, and configuration files.

   &quot;Object&quot; form shall mean any form resulting from mechanical
   transformation or translation of a Source form, including but
   not limited to compiled object code, generated documentation,
   and conversions to other media types.

   &quot;Work&quot; shall mean the work of authorship, whether in Source or
   Object form, made available under the License, as indicated by a
   copyright notice that is included in or attached to the work
   (an example is provided in the Appendix below).

   &quot;Derivative Works&quot; shall mean any work, whether in Source or Object
   form, that is based on (or derived from) the Work and for which the
   editorial revisions, annotations, elaborations, or other modifications
   represent, as a whole, an original work of authorship. For the purposes
   of this License, Derivative Works shall not include works that remain
   separable from, or merely link (or bind by name) to the interfaces of,
   the Work and Derivative Works thereof.

   &quot;Contribution&quot; shall mean any work of authorship, including
   the original version of the Work and any modifications or additions
   to that Work or Derivative Works thereof, that is intentionally
   submitted to Licensor for inclusion in the Work by the copyright owner
   or by an individual or Legal Entity authorized to submit on behalf of
   the copyright owner. For the purposes of this definition, &quot;submitted&quot;
   means any form of electronic, verbal, or written communication sent
   to the Licensor or its representatives, including but not limited to
   communication on electronic mailing lists, source code control systems,
   and issue tracking systems that are managed by, or on behalf of, the
   Licensor for the purpose of discussing and improving the Work, but
   excluding communication that is conspicuously marked or otherwise
   designated in writing by the copyright owner as &quot;Not a Contribution.&quot;

   &quot;Contributor&quot; shall mean Licensor and any individual or Legal Entity
   on behalf of whom a Contribution has been received by Licensor and
   subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   copyright license to reproduce, prepare Derivative Works of,
   publicly display, publicly perform, sublicense, and distribute the
   Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   (except as stated in this section) patent license to make, have made,
   use, offer to sell, sell, import, and otherwise transfer the Work,
   where such license applies only to those patent claims licensable
   by such Contributor that are necessarily infringed by their
   Contribution(s) alone or by combination of their Contribution(s)
   with the Work to which such Contribution(s) was submitted. If You
   institute patent litigation against any entity (including a
   cross-claim or counterclaim in a lawsuit) alleging that the Work
   or a Contribution incorporated within the Work constitutes direct
   or contributory patent infringement, then any patent licenses
   granted to You under this License for that Work shall terminate
   as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the
   Work or Derivative Works thereof in any medium, with or without
   modifications, and in Source or Object form, provided that You
   meet the following conditions:

   (a) You must give any other recipients of the Work or
   Derivative Works a copy of this License; and

   (b) You must cause any modified files to carry prominent notices
   stating that You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works
   that You distribute, all copyright, patent, trademark, and
   attribution notices from the Source form of the Work,
   excluding those notices that do not pertain to any part of
   the Derivative Works; and

   (d) If the Work includes a &quot;NOTICE&quot; text file as part of its
   distribution, then any Derivative Works that You distribute must
   include a readable copy of the attribution notices contained
   within such NOTICE file, excluding those notices that do not
   pertain to any part of the Derivative Works, in at least one
   of the following places: within a NOTICE text file distributed
   as part of the Derivative Works; within the Source form or
   documentation, if provided along with the Derivative Works; or,
   within a display generated by the Derivative Works, if and
   wherever such third-party notices normally appear. The contents
   of the NOTICE file are for informational purposes only and
   do not modify the License. You may add Your own attribution
   notices within Derivative Works that You distribute, alongside
   or as an addendum to the NOTICE text from the Work, provided
   that such additional attribution notices cannot be construed
   as modifying the License.

   You may add Your own copyright statement to Your modifications and
   may provide additional or different license terms and conditions
   for use, reproduction, or distribution of Your modifications, or
   for any such Derivative Works as a whole, provided Your use,
   reproduction, and distribution of the Work otherwise complies with
   the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise,
   any Contribution intentionally submitted for inclusion in the Work
   by You to the Licensor shall be under the terms and conditions of
   this License, without any additional terms or conditions.
   Notwithstanding the above, nothing herein shall supersede or modify
   the terms of any separate license agreement you may have executed
   with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade
   names, trademarks, service marks, or product names of the Licensor,
   except as required for reasonable and customary use in describing the
   origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or
   agreed to in writing, Licensor provides the Work (and each
   Contributor provides its Contributions) on an &quot;AS IS&quot; BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
   implied, including, without limitation, any warranties or conditions
   of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
   PARTICULAR PURPOSE. You are solely responsible for determining the
   appropriateness of using or redistributing the Work and assume any
   risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory,
   whether in tort (including negligence), contract, or otherwise,
   unless required by applicable law (such as deliberate and grossly
   negligent acts) or agreed to in writing, shall any Contributor be
   liable to You for damages, including any direct, indirect, special,
   incidental, or consequential damages of any character arising as a
   result of this License or out of the use or inability to use the
   Work (including but not limited to damages for loss of goodwill,
   work stoppage, computer failure or malfunction, or any and all
   other commercial damages or losses), even if such Contributor
   has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing
   the Work or Derivative Works thereof, You may choose to offer,
   and charge a fee for, acceptance of support, warranty, indemnity,
   or other liability obligations and/or rights consistent with this
   License. However, in accepting such obligations, You may act only
   on Your own behalf and on Your sole responsibility, not on behalf
   of any other Contributor, and only if You agree to indemnify,
   defend, and hold each Contributor harmless for any liability
   incurred by, or claims asserted against, such Contributor by reason
   of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets &quot;{}&quot;
      replaced with your own identifying information. (Don&#x27;t include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same &quot;printed page&quot; as the copyright notice for easier
      identification within third-party archives.

Copyright {yyyy} {name of copyright owner}

Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.</pre>
</li>
<li class="license">
<h3 id="BSD-2-Clause">BSD 2-Clause &quot;Simplified&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/xiph/rav1e/" target="_blank" rel="noopener">rav1e v0.8.1</a></li>
</ul>
<pre class="license-text">; Copyright © 2019-2022, VideoLAN and dav1d authors
; Copyright © 2019-2022, Two Orioles, LLC
; All rights reserved.
;
; Redistribution and use in source and binary forms, with or without
; modification, are permitted provided that the following conditions are met:
;
; 1. Redistributions of source code must retain the above copyright notice, this
; list of conditions and the following disclaimer.
;
; 2. Redistributions in binary form must reproduce the above copyright notice,
; this list of conditions and the following disclaimer in the documentation
; and/or other materials provided with the distribution.
;
; THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot; AND
; ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
; WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
; DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
; ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
; (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
; ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
; (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
; SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

struc FGData
.seed: resd 1
.num_y_points: resd 1
.y_points: resb 14 * 2
.chroma_scaling_from_luma: resd 1
.num_uv_points: resd 2
.uv_points: resb 2 * 10 * 2
.scaling_shift: resd 1
.ar_coeff_lag: resd 1
.ar_coeffs_y: resb 24
.ar_coeffs_uv: resb 2 * 28 ; includes padding
.ar_coeff_shift: resq 1
.grain_scale_shift: resd 1
.uv_mult: resd 2
.uv_luma_mult: resd 2
.uv_offset: resd 2
.overlap_flag: resd 1
.clip_to_restricted_range: resd 1
endstruc

cextern gaussian_sequence
</pre>
</li>
<li class="license">
<h3 id="BSD-2-Clause">BSD 2-Clause &quot;Simplified&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-av/v_frame" target="_blank" rel="noopener">v_frame v0.3.9</a></li>
</ul>
<pre class="license-text">BSD 2-Clause License

Copyright (c) 2017-2022, the rav1e contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

- Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot;
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="BSD-2-Clause">BSD 2-Clause &quot;Simplified&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/xiph/rav1e/" target="_blank" rel="noopener">rav1e v0.8.1</a></li>
</ul>
<pre class="license-text">BSD 2-Clause License

Copyright (c) 2017-2023, the rav1e contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

- Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot;
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="BSD-2-Clause">BSD 2-Clause &quot;Simplified&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-av/av1-grain" target="_blank" rel="noopener">av1-grain v0.2.5</a></li>
</ul>
<pre class="license-text">BSD 2-Clause License

Copyright (c) 2022-2022, the rav1e contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

- Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot;
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="BSD-2-Clause">BSD 2-Clause &quot;Simplified&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/whatisinternet/inflector" target="_blank" rel="noopener">Inflector v0.11.4</a></li>
</ul>
<pre class="license-text">Copyright (c) &lt;year&gt; &lt;owner&gt;

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot; AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="BSD-3-Clause">BSD 3-Clause &quot;New&quot; or &quot;Revised&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/hsivonen/encoding_rs" target="_blank" rel="noopener">encoding_rs v0.8.44</a></li>
</ul>
<pre class="license-text">// Copyright © WHATWG (Apple, Google, Mozilla, Microsoft).
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
// list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
// this list of conditions and the following disclaimer in the documentation
// and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot;
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/// The PUA code points special-cased in the GB18030 encoder.
pub(crate) static GB18030_2022_OVERRIDE_PUA: [u16; 18] &#x3D; [0xE78D, 0xE78E, 0xE78F, 0xE790, 0xE791, 0xE792, 0xE793, 0xE794, 0xE795, 0xE796, 0xE81E, 0xE826,
    0xE82B, 0xE82C, 0xE832, 0xE843, 0xE854, 0xE864,];

/// The bytes corresponding to the PUA code points special-cased in the GB18030 encoder.
pub(crate) static GB18030_2022_OVERRIDE_BYTES: [[u8; 2]; 18] &#x3D; [[0xA6, 0xD9],
    [0xA6, 0xDA],
    [0xA6, 0xDB],
    [0xA6, 0xDC],
    [0xA6, 0xDD],
    [0xA6, 0xDE],
    [0xA6, 0xDF],
    [0xA6, 0xEC],
    [0xA6, 0xED],
    [0xA6, 0xF3],
    [0xFE, 0x59],
    [0xFE, 0x61],
    [0xFE, 0x66],
    [0xFE, 0x67],
    [0xFE, 0x6D],
    [0xFE, 0x7E],
    [0xFE, 0x90],
    [0xFE, 0xA0],];
</pre>
</li>
<li class="license">
<h3 id="BSD-3-Clause">BSD 3-Clause &quot;New&quot; or &quot;Revised&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/kornelski/avif-serialize" target="_blank" rel="noopener">avif-serialize v0.8.9</a></li>
</ul>
<pre class="license-text">BSD 3-Clause License

Copyright (c) 2020, Cloudflare, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot;
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="BSD-3-Clause">BSD 3-Clause &quot;New&quot; or &quot;Revised&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/kornelski/cavif-rs" target="_blank" rel="noopener">ravif v0.13.0</a></li>
</ul>
<pre class="license-text">BSD 3-Clause License

Copyright (c) 2020, Kornel
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot;
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="BSD-3-Clause">BSD 3-Clause &quot;New&quot; or &quot;Revised&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/dropbox/rust-alloc-no-stdlib" target="_blank" rel="noopener">alloc-no-stdlib v3.0.0</a></li>
<li><a href="https://github.com/dropbox/rust-brotli" target="_blank" rel="noopener">brotli v9.1.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016 Dropbox, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot; AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="BSD-3-Clause">BSD 3-Clause &quot;New&quot; or &quot;Revised&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/dalek-cryptography/subtle" target="_blank" rel="noopener">subtle v2.6.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016-2017 Isis Agora Lovecruft, Henry de Valence. All rights reserved.
Copyright (c) 2016-2024 Isis Agora Lovecruft. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS
IS&quot; AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="BSD-3-Clause">BSD 3-Clause &quot;New&quot; or &quot;Revised&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/johannesvollmer/lebe" target="_blank" rel="noopener">lebe v0.5.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2022 Contributors to the lebe Project. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software without
   specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot;
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="BSD-3-Clause">BSD 3-Clause &quot;New&quot; or &quot;Revised&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/dropbox/rust-alloc-no-stdlib" target="_blank" rel="noopener">alloc-stdlib v0.3.0</a></li>
<li><a href="https://github.com/aws/aws-lc-rs" target="_blank" rel="noopener">aws-lc-sys v0.47.0</a></li>
<li><a href="https://github.com/johannesvollmer/exrs" target="_blank" rel="noopener">exr v1.74.2</a></li>
</ul>
<pre class="license-text">Copyright (c) &lt;year&gt; &lt;owner&gt;.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot; AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="BSD-3-Clause">BSD 3-Clause &quot;New&quot; or &quot;Revised&quot; License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/hsivonen/encoding_rs" target="_blank" rel="noopener">encoding_rs v0.8.44</a></li>
</ul>
<pre class="license-text">Copyright © WHATWG (Apple, Google, Mozilla, Microsoft).

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS &quot;AS IS&quot;
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
</pre>
</li>
<li class="license">
<h3 id="CDLA-Permissive-2.0">Community Data License Agreement Permissive 2.0</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rustls/webpki-roots" target="_blank" rel="noopener">webpki-root-certs v1.0.11</a></li>
</ul>
<pre class="license-text"># Community Data License Agreement - Permissive - Version 2.0

This is the Community Data License Agreement - Permissive, Version
2.0 (the &quot;agreement&quot;). Data Provider(s) and Data Recipient(s) agree
as follows:

## 1. Provision of the Data

1.1. A Data Recipient may use, modify, and share the Data made
available by Data Provider(s) under this agreement if that Data
Recipient follows the terms of this agreement.

1.2. This agreement does not impose any restriction on a Data
Recipient&#x27;s use, modification, or sharing of any portions of the
Data that are in the public domain or that may be used, modified,
or shared under any other legal exception or limitation.

## 2. Conditions for Sharing Data

2.1. A Data Recipient may share Data, with or without modifications, so
long as the Data Recipient makes available the text of this agreement
with the shared Data.

## 3. No Restrictions on Results

3.1. This agreement does not impose any restriction or obligations
with respect to the use, modification, or sharing of Results.

## 4. No Warranty; Limitation of Liability

4.1. All Data Recipients receive the Data subject to the following
terms:

THE DATA IS PROVIDED ON AN &quot;AS IS&quot; BASIS, WITHOUT REPRESENTATIONS,
WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED
INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE,
NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.

NO DATA PROVIDER SHALL HAVE ANY LIABILITY FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING
WITHOUT LIMITATION LOST PROFITS), HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE DATA OR RESULTS,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

## 5. Definitions

5.1. &quot;Data&quot; means the material received by a Data Recipient under
this agreement.

5.2. &quot;Data Provider&quot; means any person who is the source of Data
provided under this agreement and in reliance on a Data Recipient&#x27;s
agreement to its terms.

5.3. &quot;Data Recipient&quot; means any person who receives Data directly
or indirectly from a Data Provider and agrees to the terms of this
agreement.

5.4. &quot;Results&quot; means any outcome obtained by computational analysis
of Data, including for example machine learning models and models&#x27;
insights.
</pre>
</li>
<li class="license">
<h3 id="ISC">ISC License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/briansmith/untrusted" target="_blank" rel="noopener">untrusted v0.9.0</a></li>
</ul>
<pre class="license-text">// Copyright 2015-2016 Brian Smith.
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED &quot;AS IS&quot; AND THE AUTHORS DISCLAIM ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="ISC">ISC License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/nagisa/rust_libloading/" target="_blank" rel="noopener">libloading v0.7.4</a></li>
<li><a href="https://github.com/nagisa/rust_libloading/" target="_blank" rel="noopener">libloading v0.9.0</a></li>
</ul>
<pre class="license-text">Copyright © 2015, Simonas Kazlauskas

Permission to use, copy, modify, and/or distribute this software for any purpose with or without
fee is hereby granted, provided that the above copyright notice and this permission notice appear
in all copies.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot; AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS
SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="ISC">ISC License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rustls/webpki" target="_blank" rel="noopener">rustls-webpki v0.103.16</a></li>
</ul>
<pre class="license-text">Except as otherwise noted, this project is licensed under the following
(ISC-style) terms:

Copyright 2015 Brian Smith.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot; AND THE AUTHORS DISCLAIM ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

The files under third-party/chromium are licensed as described in
third-party/chromium/LICENSE.
</pre>
</li>
<li class="license">
<h3 id="ISC">ISC License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/aws/aws-lc-rs" target="_blank" rel="noopener">aws-lc-rs v1.19.0</a></li>
<li><a href="https://github.com/aws/aws-lc-rs" target="_blank" rel="noopener">aws-lc-sys v0.47.0</a></li>
</ul>
<pre class="license-text">ISC License

Copyright &lt;year&gt; &lt;owner&gt;

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot; AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/haraldh/rust_uds_windows" target="_blank" rel="noopener">uds_windows v1.2.1</a></li>
</ul>
<pre class="license-text"> MIT License

    Copyright (c) Microsoft Corporation. All rights reserved.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the &quot;Software&quot;), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/katharostech/cfg_aliases" target="_blank" rel="noopener">cfg_aliases v0.2.2</a></li>
                </ul>
                <pre class="license-text"># 3rd Party Notices

The &#x60;cfg_aliases!&#x60; macro uses a lot of the code from [&#x60;tectonic_cfg_support::target_cfg!&#x60;] macro which is under the following license:

[&#x60;tectonic_cfg_support::target_cfg!&#x60;]: https://github.com/tectonic-typesetting/tectonic/blob/f2439b936470ad27bdf92882064bc4702ee01899/cfg_support/src/lib.rs#L166

    tectonic_cfg_support is licensed under the MIT License.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the “Software”), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

---

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/GREsau/schemars" target="_blank" rel="noopener">schemars_derive v0.8.22</a></li>
                </ul>
                <pre class="license-text">#![allow(clippy::all)]
// Copied from regex_syntax crate to avoid pulling in the whole crate just for a utility function
// https://github.com/rust-lang/regex/blob/431c4e4867e1eb33eb39b23ed47c9934b2672f8f/regex-syntax/src/lib.rs
//
// Copyright (c) 2014 The Rust Project Developers
//
// Permission is hereby granted, free of charge, to any
// person obtaining a copy of this software and associated
// documentation files (the &quot;Software&quot;), to deal in the
// Software without restriction, including without
// limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software
// is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice
// shall be included in all copies or substantial portions
// of the Software.
//
// THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
// ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
// TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
// SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
// IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

pub fn escape(text: &amp;str) -&gt; String {
let mut quoted &#x3D; String::new();
escape_into(text, &amp;mut quoted);
quoted
}

fn escape_into(text: &amp;str, buf: &amp;mut String) {
buf.reserve(text.len());
for c in text.chars() {
if is_meta_character(c) {
buf.push(&#x27;\\&#x27;);
}
buf.push(c);
}
}

fn is_meta_character(c: char) -&gt; bool {
match c {
&#x27;\\&#x27; | &#x27;.&#x27; | &#x27;+&#x27; | &#x27;*&#x27; | &#x27;?&#x27; | &#x27;(&#x27; | &#x27;)&#x27; | &#x27;|&#x27; | &#x27;[&#x27; | &#x27;]&#x27; | &#x27;{&#x27; | &#x27;}&#x27; | &#x27;^&#x27; | &#x27;$&#x27;
        | &#x27;#&#x27; | &#x27;&amp;&#x27; | &#x27;-&#x27; | &#x27;~&#x27; &#x3D;&gt; true,
        _ &#x3D;&gt; false,
    }
}
</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/aldanor/qoi-rust" target="_blank" rel="noopener">qoi v0.4.1</a></li>
                </ul>
                <pre class="license-text">/*

clang fuzzing harness for qoi_decode

Compile and run with:
clang -fsanitize&#x3D;address,fuzzer -g -O0 qoifuzz.c &amp;&amp; ./a.out

Dominic Szablewski - https://phoboslab.org


-- LICENSE: The MIT License(MIT)

Copyright(c) 2021 Dominic Szablewski

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files(the &quot;Software&quot;), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and / or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions :
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/


#define QOI_IMPLEMENTATION
#include &quot;qoi.h&quot;
#include &lt;stddef.h&gt;
#include &lt;stdint.h&gt;

int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
int w, h;
if (size &lt; 4) {
return 0;
}

    qoi_desc desc;
    void* decoded &#x3D; qoi_decode((void*)(data + 4), (int)(size - 4), &amp;desc, *((int *)data));
    if (decoded !&#x3D; NULL) {
    	free(decoded);
    }
    return 0;
}
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/diwic/dbus-rs" target="_blank" rel="noopener">libdbus-sys v0.2.7</a></li>
</ul>
<pre class="license-text">/* dbus-server-launchd.h Server methods for interacting with launchd.
- Copyright (C) 2008, Benjamin Reed &lt;rangerrick@befunk.com&gt;
-
- Permission is hereby granted, free of charge, to any person
- obtaining a copy of this software and associated documentation
- files (the &quot;Software&quot;), to deal in the Software without
- restriction, including without limitation the rights to use, copy,
- modify, merge, publish, distribute, sublicense, and/or sell copies
- of the Software, and to permit persons to whom the Software is
- furnished to do so, subject to the following conditions:
-
- The above copyright notice and this permission notice shall be
- included in all copies or substantial portions of the Software.
-
- THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND,
- EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
- MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
- NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
- HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
- WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
- OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
- DEALINGS IN THE SOFTWARE.
  */

#ifndef DBUS_SERVER_LAUNCHD_H
#define DBUS_SERVER_LAUNCHD_H

#include &lt;dbus/dbus-internals.h&gt;
#include &lt;dbus/dbus-server-protected.h&gt;

DBUS_BEGIN_DECLS

DBusServer * _dbus_server_new_for_launchd (const char *launchd_env_var, DBusError * error);

DBUS_END_DECLS
#endif /* DBUS_SERVER_LAUNCHD_H */
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/gilnaa/globwalk" target="_blank" rel="noopener">globwalk v0.8.1</a></li>
</ul>
<pre class="license-text">// Copyright (c) 2018 Gilad Naaman
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the &quot;Software&quot;), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

extern crate globwalk;

use globwalk::GlobWalkerBuilder;
use std::env::args;

fn main() {
let patterns &#x3D; args().skip(1).collect::&lt;Vec&lt;_&gt;&gt;();

    for f in GlobWalkerBuilder::from_patterns(&quot;.&quot;, &amp;patterns[..])
        .build()
        .unwrap()
    {
        println!(&quot;{:?}&quot;, f.unwrap().path());
    }
}
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/smol-rs/atomic-waker" target="_blank" rel="noopener">atomic-waker v1.1.2</a></li>
<li><a href="https://github.com/smol-rs/futures-lite" target="_blank" rel="noopener">futures-lite v2.6.1</a></li>
</ul>
<pre class="license-text">&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;

Copyright (c) 2016 Alex Crichton
Copyright (c) 2017 The Tokio Authors

Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;

Copyright (c) 2016 Alex Crichton
Copyright (c) 2017 The Tokio Authors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/RustCrypto/hashes" target="_blank" rel="noopener">sha2 v0.10.9</a></li>
</ul>
<pre class="license-text">Copyright (c) 2006-2009 Graydon Hoare
Copyright (c) 2009-2013 Mozilla Foundation
Copyright (c) 2016 Artyom Pavlov

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/dropbox/rust-brotli" target="_blank" rel="noopener">brotli v9.1.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2009, 2010, 2013-2016 by the Brotli Authors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-fuzz/libfuzzer" target="_blank" rel="noopener">libfuzzer-sys v0.4.13</a></li>
<li><a href="https://github.com/rayon-rs/rayon" target="_blank" rel="noopener">rayon-core v1.13.0</a></li>
<li><a href="https://github.com/rayon-rs/rayon" target="_blank" rel="noopener">rayon v1.12.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2010 The Rust Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/servo/core-foundation-rs" target="_blank" rel="noopener">core-foundation-sys v0.8.7</a></li>
<li><a href="https://github.com/servo/core-foundation-rs" target="_blank" rel="noopener">core-foundation v0.10.1</a></li>
<li><a href="https://github.com/servo/core-foundation-rs" target="_blank" rel="noopener">core-foundation v0.9.4</a></li>
<li><a href="https://github.com/servo/core-foundation-rs" target="_blank" rel="noopener">core-graphics-types v0.2.0</a></li>
<li><a href="https://github.com/servo/core-foundation-rs" target="_blank" rel="noopener">core-graphics v0.25.0</a></li>
<li><a href="https://github.com/servo/string-cache" target="_blank" rel="noopener">string_cache v0.9.0</a></li>
<li><a href="https://github.com/servo/string-cache" target="_blank" rel="noopener">string_cache_codegen v0.6.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2012-2013 Mozilla Foundation

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/KokaKiwi/rust-hex" target="_blank" rel="noopener">hex v0.4.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2013-2014 The Rust Project Developers.
Copyright (c) 2015-2020 The rust-hex Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/servo/rust-url" target="_blank" rel="noopener">form_urlencoded v1.2.2</a></li>
</ul>
<pre class="license-text">Copyright (c) 2013-2016 The rust-url developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/servo/rust-url/" target="_blank" rel="noopener">idna v1.1.0</a></li>
<li><a href="https://github.com/servo/rust-url/" target="_blank" rel="noopener">percent-encoding v2.3.2</a></li>
<li><a href="https://github.com/servo/rust-url" target="_blank" rel="noopener">url v2.5.8</a></li>
</ul>
<pre class="license-text">Copyright (c) 2013-2025 The rust-url developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-lang/cc-rs" target="_blank" rel="noopener">cc v1.11.1</a></li>
<li><a href="https://github.com/rust-lang/cfg-if" target="_blank" rel="noopener">cfg-if v1.0.5</a></li>
<li><a href="https://github.com/rust-lang/cmake-rs" target="_blank" rel="noopener">cmake v0.1.58</a></li>
<li><a href="https://github.com/rust-lang/cc-rs" target="_blank" rel="noopener">find-msvc-tools v0.1.15</a></li>
<li><a href="https://github.com/rust-lang/jobserver-rs" target="_blank" rel="noopener">jobserver v0.1.35</a></li>
<li><a href="https://github.com/wasm-bindgen/wasm-bindgen/tree/master/crates/js-sys" target="_blank" rel="noopener">js-sys v0.3.107</a></li>
<li><a href="https://github.com/rustls/openssl-probe" target="_blank" rel="noopener">openssl-probe v0.2.2</a></li>
<li><a href="https://github.com/rust-lang/pkg-config-rs" target="_blank" rel="noopener">pkg-config v0.3.34</a></li>
<li><a href="https://github.com/rust-lang/socket2" target="_blank" rel="noopener">socket2 v0.6.5</a></li>
<li><a href="https://github.com/wasm-bindgen/wasm-bindgen/tree/master/crates/futures" target="_blank" rel="noopener">wasm-bindgen-futures v0.4.80</a></li>
<li><a href="https://github.com/wasm-bindgen/wasm-bindgen/tree/main/crates/macro-support" target="_blank" rel="noopener">wasm-bindgen-macro-support v0.2.130</a></li>
<li><a href="https://github.com/wasm-bindgen/wasm-bindgen/tree/master/crates/macro" target="_blank" rel="noopener">wasm-bindgen-macro v0.2.130</a></li>
<li><a href="https://github.com/wasm-bindgen/wasm-bindgen/tree/master/crates/shared" target="_blank" rel="noopener">wasm-bindgen-shared v0.2.130</a></li>
<li><a href="https://github.com/wasm-bindgen/wasm-bindgen" target="_blank" rel="noopener">wasm-bindgen v0.2.130</a></li>
<li><a href="https://github.com/wasm-bindgen/wasm-bindgen/tree/master/crates/web-sys" target="_blank" rel="noopener">web-sys v0.3.107</a></li>
</ul>
<pre class="license-text">Copyright (c) 2014 Alex Crichton

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tokio-rs/mio" target="_blank" rel="noopener">mio v1.2.4</a></li>
</ul>
<pre class="license-text">Copyright (c) 2014 Carl Lerche and other MIO contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/lambda-fairy/rust-errno" target="_blank" rel="noopener">errno v0.3.14</a></li>
</ul>
<pre class="license-text">Copyright (c) 2014 Chris Wong

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/hyperium/mime" target="_blank" rel="noopener">mime v0.3.17</a></li>
</ul>
<pre class="license-text">Copyright (c) 2014 Sean McArthur

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/hsivonen/any_all_workaround" target="_blank" rel="noopener">any_all_workaround v0.1.0</a></li>
                    <li><a href="https://github.com/bitflags/bitflags" target="_blank" rel="noopener">bitflags v1.3.2</a></li>
                    <li><a href="https://github.com/bitflags/bitflags" target="_blank" rel="noopener">bitflags v2.13.2</a></li>
                    <li><a href="https://github.com/rust-lang/glob" target="_blank" rel="noopener">glob v0.3.4</a></li>
                    <li><a href="https://github.com/rust-lang/log" target="_blank" rel="noopener">log v0.4.35</a></li>
                    <li><a href="https://github.com/rust-num/num-bigint" target="_blank" rel="noopener">num-bigint v0.4.8</a></li>
                    <li><a href="https://github.com/rust-num/num-complex" target="_blank" rel="noopener">num-complex v0.4.6</a></li>
                    <li><a href="https://github.com/rust-num/num-derive" target="_blank" rel="noopener">num-derive v0.4.2</a></li>
                    <li><a href="https://github.com/rust-num/num-integer" target="_blank" rel="noopener">num-integer v0.1.47</a></li>
                    <li><a href="https://github.com/rust-num/num-rational" target="_blank" rel="noopener">num-rational v0.4.2</a></li>
                    <li><a href="https://github.com/rust-num/num-traits" target="_blank" rel="noopener">num-traits v0.2.19</a></li>
                    <li><a href="https://github.com/rust-lang/regex" target="_blank" rel="noopener">regex-automata v0.4.18</a></li>
                    <li><a href="https://github.com/rust-lang/regex" target="_blank" rel="noopener">regex-syntax v0.8.11</a></li>
                    <li><a href="https://github.com/rust-lang/regex" target="_blank" rel="noopener">regex v1.13.1</a></li>
                </ul>
                <pre class="license-text">Copyright (c) 2014 The Rust Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/uuid-rs/uuid" target="_blank" rel="noopener">uuid v1.29.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2014 The Rust Project Developers
Copyright (c) 2018 Ashley Mannix, Christopher Armstrong, Dylan DPC, Hunar Roop Kahlon

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/servo/html5ever" target="_blank" rel="noopener">html5ever v0.39.0</a></li>
<li><a href="https://github.com/servo/html5ever" target="_blank" rel="noopener">markup5ever v0.39.0</a></li>
<li><a href="https://github.com/servo/html5ever" target="_blank" rel="noopener">web_atoms v0.2.6</a></li>
</ul>
<pre class="license-text">Copyright (c) 2014 The html5ever Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/diwic/dbus-rs" target="_blank" rel="noopener">dbus v0.9.12</a></li>
<li><a href="https://github.com/diwic/dbus-rs" target="_blank" rel="noopener">libdbus-sys v0.2.7</a></li>
</ul>
<pre class="license-text">Copyright (c) 2014-2018 David Henningsson &lt;diwic@ubuntu.com&gt; and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-bakery/nom" target="_blank" rel="noopener">nom v8.0.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2014-2019 Geoffroy Couprie

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
&quot;Software&quot;), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-lang/flate2-rs" target="_blank" rel="noopener">flate2 v1.1.10</a></li>
</ul>
<pre class="license-text">Copyright (c) 2014-2026 Alex Crichton

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/hyperium/hyper" target="_blank" rel="noopener">hyper v1.12.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2014-2026 Sean McArthur

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rayon-rs/either" target="_blank" rel="noopener">either v1.19.0</a></li>
<li><a href="https://github.com/rust-itertools/itertools" target="_blank" rel="noopener">itertools v0.11.0</a></li>
<li><a href="https://github.com/rust-itertools/itertools" target="_blank" rel="noopener">itertools v0.14.0</a></li>
<li><a href="https://github.com/jonasbb/serde_with/" target="_blank" rel="noopener">serde_with v3.24.0</a></li>
<li><a href="https://github.com/jonasbb/serde_with/" target="_blank" rel="noopener">serde_with_macros v3.24.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/ebarnard/rust-plist/" target="_blank" rel="noopener">plist v1.10.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 Edward Barnard

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/fbernier/base62" target="_blank" rel="noopener">base62 v2.2.6</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 François Bernier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/gentoo90/winreg-rs" target="_blank" rel="noopener">winreg v0.56.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 Igor Shaula

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/mbrubeck/rust-debug-unreachable" target="_blank" rel="noopener">new_debug_unreachable v1.0.6</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 Jonathan Reem

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/servo/html5ever" target="_blank" rel="noopener">tendril v0.5.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 Keegan McAllister

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/Stebalien/tempfile" target="_blank" rel="noopener">tempfile v3.27.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 Steven Allen

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/withoutboats/heck" target="_blank" rel="noopener">heck v0.4.1</a></li>
<li><a href="https://github.com/withoutboats/heck" target="_blank" rel="noopener">heck v0.5.0</a></li>
<li><a href="https://github.com/unicode-rs/unicode-segmentation" target="_blank" rel="noopener">unicode-segmentation v1.13.3</a></li>
<li><a href="https://github.com/unicode-rs/unicode-width" target="_blank" rel="noopener">unicode-width v0.2.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 The Rust Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="http://github.com/tailhook/quick-error" target="_blank" rel="noopener">quick-error v2.0.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 The quick-error Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/jni-rs/jni-sys" target="_blank" rel="noopener">jni-sys v0.3.1</a></li>
<li><a href="https://github.com/jni-rs/jni-sys" target="_blank" rel="noopener">jni-sys v0.4.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 The rust-jni-sys Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/image-rs/image-png" target="_blank" rel="noopener">png v0.18.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 nwin

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/steffengy/schannel-rs" target="_blank" rel="noopener">schannel v0.1.30</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015 steffengy

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/retep998/winapi-rs" target="_blank" rel="noopener">winapi v0.3.9</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015-2018 The winapi-rs Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/seanmonstar/httparse" target="_blank" rel="noopener">httparse v1.10.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2015-2025 Sean McArthur

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/rust-lang/futures-rs" target="_blank" rel="noopener">futures-channel v0.3.34</a></li>
                    <li><a href="https://github.com/rust-lang/futures-rs" target="_blank" rel="noopener">futures-core v0.3.34</a></li>
                    <li><a href="https://github.com/rust-lang/futures-rs" target="_blank" rel="noopener">futures-executor v0.3.34</a></li>
                    <li><a href="https://github.com/rust-lang/futures-rs" target="_blank" rel="noopener">futures-io v0.3.34</a></li>
                    <li><a href="https://github.com/rust-lang/futures-rs" target="_blank" rel="noopener">futures-macro v0.3.34</a></li>
                    <li><a href="https://github.com/rust-lang/futures-rs" target="_blank" rel="noopener">futures-sink v0.3.34</a></li>
                    <li><a href="https://github.com/rust-lang/futures-rs" target="_blank" rel="noopener">futures-task v0.3.34</a></li>
                    <li><a href="https://github.com/rust-lang/futures-rs" target="_blank" rel="noopener">futures-util v0.3.34</a></li>
                </ul>
                <pre class="license-text">Copyright (c) 2016 Alex Crichton
Copyright (c) 2017 The Tokio Authors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-lang/hashbrown" target="_blank" rel="noopener">hashbrown v0.12.3</a></li>
<li><a href="https://github.com/rust-lang/hashbrown" target="_blank" rel="noopener">hashbrown v0.17.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016 Amanieu d&#x27;Antras

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tauri-apps/webkit2gtk-rs" target="_blank" rel="noopener">webkit2gtk-sys v2.0.2</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016 Boucher, Antoni &lt;bouanto@zoho.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the &quot;Software&quot;), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tauri-apps/webkit2gtk-rs" target="_blank" rel="noopener">webkit2gtk v2.0.2</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016 Boucher, Antoni &lt;bouanto@zoho.com&gt;
Copyright (c) 2017-2021, The Gtk-rs Project Developers.
Copyright (c) 2021, Tauri Programme within The Commons Conservancy

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the &quot;Software&quot;), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rustls/hyper-rustls" target="_blank" rel="noopener">hyper-rustls v0.27.10</a></li>
<li><a href="https://github.com/rustls/rustls-native-certs" target="_blank" rel="noopener">rustls-native-certs v0.8.5</a></li>
<li><a href="https://github.com/rustls/rustls" target="_blank" rel="noopener">rustls v0.23.46</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016 Joseph Birr-Pixton &lt;jpixton@gmail.com&gt;

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/Amanieu/parking_lot" target="_blank" rel="noopener">lock_api v0.4.14</a></li>
<li><a href="https://github.com/Amanieu/parking_lot" target="_blank" rel="noopener">lock_api v0.5.0</a></li>
<li><a href="https://github.com/Amanieu/parking_lot" target="_blank" rel="noopener">parking_lot v0.12.5</a></li>
<li><a href="https://github.com/Amanieu/parking_lot" target="_blank" rel="noopener">parking_lot v0.13.0</a></li>
<li><a href="https://github.com/Amanieu/parking_lot" target="_blank" rel="noopener">parking_lot_core v0.10.0</a></li>
<li><a href="https://github.com/Amanieu/parking_lot" target="_blank" rel="noopener">parking_lot_core v0.9.12</a></li>
<li><a href="https://github.com/djc/rustc-version-rs" target="_blank" rel="noopener">rustc_version v0.4.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016 The Rust Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/bluss/indexmap" target="_blank" rel="noopener">indexmap v1.9.3</a></li>
<li><a href="https://github.com/indexmap-rs/indexmap" target="_blank" rel="noopener">indexmap v2.14.2</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016--2017

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/indexmap-rs/equivalent" target="_blank" rel="noopener">equivalent v1.0.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016--2023

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/bluss/scopeguard" target="_blank" rel="noopener">scopeguard v1.2.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016-2019 Ulrik Sverdrup &quot;bluss&quot; and scopeguard developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/seanmonstar/reqwest" target="_blank" rel="noopener">reqwest v0.13.5</a></li>
</ul>
<pre class="license-text">Copyright (c) 2016-2026 Sean McArthur

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/RustCrypto/hashes" target="_blank" rel="noopener">md-5 v0.11.0</a></li>
                </ul>
                <pre class="license-text">Copyright (c) 2016-2026 The RustCrypto Project Developers
Copyright (c) 2016 Artyom Pavlov
Copyright (c) 2009-2013 Mozilla Foundation
Copyright (c) 2006-2009 Graydon Hoare

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/RustCrypto/traits" target="_blank" rel="noopener">digest v0.10.7</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Artyom Pavlov

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tuffy/bitstream-io" target="_blank" rel="noopener">bitstream-io v4.10.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Brian Langenberger

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/servo/rust-fnv" target="_blank" rel="noopener">fnv v1.0.7</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Contributors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/gilnaa/globwalk" target="_blank" rel="noopener">globwalk v0.8.1</a></li>
<li><a href="https://github.com/Gilnaa/memoffset" target="_blank" rel="noopener">memoffset v0.9.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Gilad Naaman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-embedded-community/aligned" target="_blank" rel="noopener">aligned v0.4.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Jorge Aparicio

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/meithecatte/enumflags2" target="_blank" rel="noopener">enumflags2_derive v0.7.12</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Maik Klein

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-windowing/keyboard-types" target="_blank" rel="noopener">keyboard-types v0.8.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Pyfisch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://gitlab.redox-os.org/redox-os/syscall" target="_blank" rel="noopener">redox_syscall v0.5.18</a></li>
<li><a href="https://gitlab.redox-os.org/redox-os/kernel" target="_blank" rel="noopener">redox_syscall v0.9.5</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Redox OS Developers

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
&quot;Software&quot;), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/storyyeller/stable_deref_trait" target="_blank" rel="noopener">stable_deref_trait v1.2.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Robert Grosse

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/SergioBenitez/cookie-rs" target="_blank" rel="noopener">cookie v0.18.2</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Sergio Benitez
Copyright (c) 2014 Alex Crichton

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/sfackler/foreign-types" target="_blank" rel="noopener">foreign-types-macros v0.2.4</a></li>
<li><a href="https://github.com/sfackler/foreign-types" target="_blank" rel="noopener">foreign-types-shared v0.3.1</a></li>
<li><a href="https://github.com/sfackler/foreign-types" target="_blank" rel="noopener">foreign-types v0.5.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 The foreign-types Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://gitlab.com/timvisee/version-compare" target="_blank" rel="noopener">version-compare v0.2.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 Tim Visée

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/vorner/arc-swap" target="_blank" rel="noopener">arc-swap v1.9.3</a></li>
                </ul>
                <pre class="license-text">Copyright (c) 2017 arc-swap developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/hyperium/h2" target="_blank" rel="noopener">h2 v0.4.20</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 h2 authors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/hyperium/http" target="_blank" rel="noopener">http v1.5.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 http-rs authors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rustls/tokio-rustls" target="_blank" rel="noopener">tokio-rustls v0.26.6</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 quininer kel

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/vorner/signal-hook" target="_blank" rel="noopener">signal-hook-registry v1.4.8</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017 tokio-jsonrpc developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/thomcc/core_detect" target="_blank" rel="noopener">core_detect v1.0.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017-2020 The Rust Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/meithecatte/enumflags2" target="_blank" rel="noopener">enumflags2 v0.7.12</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017-2023 Maik Klein, Maja Kądziołka

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/RustCrypto/traits" target="_blank" rel="noopener">digest v0.11.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2017-2025 RustCrypto Developers
Copyright (c) 2017 Artyom Pavlov

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tokio-rs/bytes" target="_blank" rel="noopener">bytes v1.12.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2018 Carl Lerche

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/japaric/as-slice" target="_blank" rel="noopener">as-slice v0.2.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2018 Jorge Aparicio

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/cuviper/autocfg" target="_blank" rel="noopener">autocfg v1.5.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2018 Josh Stone

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/servo/rust-smallvec" target="_blank" rel="noopener">smallvec v1.16.4</a></li>
</ul>
<pre class="license-text">Copyright (c) 2018 The Servo Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/seanmonstar/want" target="_blank" rel="noopener">want v0.3.2</a></li>
</ul>
<pre class="license-text">Copyright (c) 2018-2019 Sean McArthur

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/RustCrypto/utils" target="_blank" rel="noopener">block-buffer v0.10.4</a></li>
                </ul>
                <pre class="license-text">Copyright (c) 2018-2019 The RustCrypto Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/dirs-dev/dirs-sys-rs" target="_blank" rel="noopener">dirs-sys v0.5.0</a></li>
<li><a href="https://codeberg.org/dirs/dirs-rs" target="_blank" rel="noopener">dirs v7.0.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2018-2019 dirs-rs contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/seanmonstar/try-lock" target="_blank" rel="noopener">try-lock v0.2.5</a></li>
</ul>
<pre class="license-text">Copyright (c) 2018-2023 Sean McArthur
Copyright (c) 2016 Alex Crichton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/RustCrypto/utils" target="_blank" rel="noopener">block-buffer v0.12.1</a></li>
                </ul>
                <pre class="license-text">Copyright (c) 2018-2025 The RustCrypto Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-random/getrandom" target="_blank" rel="noopener">getrandom v0.3.4</a></li>
</ul>
<pre class="license-text">Copyright (c) 2018-2025 The rust-random Project Developers
Copyright (c) 2014 The Rust Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/RustCrypto/utils" target="_blank" rel="noopener">zeroize v1.9.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2018-2026 The RustCrypto Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-random/getrandom" target="_blank" rel="noopener">getrandom v0.4.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2018-2026 The rust-random Project Developers
Copyright (c) 2014 The Rust Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tokio-rs/slab" target="_blank" rel="noopener">slab v0.4.12</a></li>
</ul>
<pre class="license-text">Copyright (c) 2019 Carl Lerche

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/EmbarkStudios/cfg-expr" target="_blank" rel="noopener">cfg-expr v0.15.8</a></li>
</ul>
<pre class="license-text">Copyright (c) 2019 Embark Studios

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/fitzgen/bumpalo" target="_blank" rel="noopener">bumpalo v3.20.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2019 Nick Fitzgerald

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/cryptocorrosion/cryptocorrosion" target="_blank" rel="noopener">ppv-lite86 v0.2.21</a></li>
</ul>
<pre class="license-text">Copyright (c) 2019 The CryptoCorrosion Contributors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tokio-rs/tracing" target="_blank" rel="noopener">tracing-attributes v0.1.31</a></li>
<li><a href="https://github.com/tokio-rs/tracing" target="_blank" rel="noopener">tracing-core v0.1.36</a></li>
<li><a href="https://github.com/tokio-rs/tracing" target="_blank" rel="noopener">tracing v0.1.44</a></li>
</ul>
<pre class="license-text">Copyright (c) 2019 Tokio Contributors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tower-rs/tower" target="_blank" rel="noopener">tower-layer v0.3.3</a></li>
<li><a href="https://github.com/tower-rs/tower" target="_blank" rel="noopener">tower-service v0.3.3</a></li>
<li><a href="https://github.com/tower-rs/tower" target="_blank" rel="noopener">tower v0.5.3</a></li>
</ul>
<pre class="license-text">Copyright (c) 2019 Tower Contributors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tower-rs/tower-http" target="_blank" rel="noopener">tower-http v0.6.11</a></li>
</ul>
<pre class="license-text">Copyright (c) 2019-2021 Tower Contributors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/hyperium/http-body" target="_blank" rel="noopener">http-body-util v0.1.5</a></li>
<li><a href="https://github.com/hyperium/http-body" target="_blank" rel="noopener">http-body v1.1.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2019-2026 Sean McArthur &amp; Hyper Contributors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/RustCrypto/utils" target="_blank" rel="noopener">zeroize_derive v1.5.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2019-2026 The RustCrypto Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/strawlab/iana-time-zone" target="_blank" rel="noopener">iana-time-zone-haiku v0.1.2</a></li>
<li><a href="https://github.com/strawlab/iana-time-zone" target="_blank" rel="noopener">iana-time-zone v0.1.65</a></li>
</ul>
<pre class="license-text">Copyright (c) 2020 Andrew D. Straw

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/wcampbell0x2a/no-std-io2" target="_blank" rel="noopener">no_std_io2 v0.9.4</a></li>
</ul>
<pre class="license-text">Copyright (c) 2020-2021 Brendan Molloy &lt;brendan@bbqsrc.net&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/RustCrypto/utils" target="_blank" rel="noopener">cpufeatures v0.2.17</a></li>
</ul>
<pre class="license-text">Copyright (c) 2020-2025 The RustCrypto Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/RustCrypto/formats" target="_blank" rel="noopener">const-oid v0.10.2</a></li>
</ul>
<pre class="license-text">Copyright (c) 2020-2026 The RustCrypto Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/RustCrypto/traits" target="_blank" rel="noopener">crypto-common v0.1.7</a></li>
</ul>
<pre class="license-text">Copyright (c) 2021 RustCrypto Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/RustCrypto/traits" target="_blank" rel="noopener">crypto-common v0.2.2</a></li>
</ul>
<pre class="license-text">Copyright (c) 2021-2026 RustCrypto Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/aldanor/qoi-rust" target="_blank" rel="noopener">qoi v0.4.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2022 Ivan Smirnov

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/RustCrypto/hybrid-array" target="_blank" rel="noopener">hybrid-array v0.4.15</a></li>
</ul>
<pre class="license-text">Copyright (c) 2022-2026 The RustCrypto Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rustls/pki-types" target="_blank" rel="noopener">rustls-pki-types v1.15.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2023 Dirkjan Ochtman &lt;dirkjan@ochtman.nl&gt;

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/jhpratt/powerfmt" target="_blank" rel="noopener">powerfmt v0.2.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2023 Jacob Pratt et al.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/contain-rs/bit-set" target="_blank" rel="noopener">bit-set v0.8.0</a></li>
<li><a href="https://github.com/contain-rs/bit-vec" target="_blank" rel="noopener">bit-vec v0.8.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2023 The Rust Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/Brendonovich/swift-rs" target="_blank" rel="noopener">swift-rs v1.0.9</a></li>
</ul>
<pre class="license-text">Copyright (c) 2023 The swift-rs Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/hyperium/hyper-util" target="_blank" rel="noopener">hyper-util v0.1.21</a></li>
</ul>
<pre class="license-text">Copyright (c) 2023-2025 Sean McArthur

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/jhpratt/deranged" target="_blank" rel="noopener">deranged v0.5.9</a></li>
</ul>
<pre class="license-text">Copyright (c) 2024 Jacob Pratt et al.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/mullvad/system-configuration-rs" target="_blank" rel="noopener">system-configuration-sys v0.6.0</a></li>
<li><a href="https://github.com/mullvad/system-configuration-rs" target="_blank" rel="noopener">system-configuration v0.7.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2024 Mullvad VPN AB

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/z-galaxy/zbus/" target="_blank" rel="noopener">zbus v5.19.0</a></li>
<li><a href="https://github.com/z-galaxy/zbus/" target="_blank" rel="noopener">zbus_macros v5.19.0</a></li>
<li><a href="https://github.com/z-galaxy/zbus/" target="_blank" rel="noopener">zbus_names v4.3.5</a></li>
<li><a href="https://github.com/z-galaxy/zbus/" target="_blank" rel="noopener">zvariant v5.15.1</a></li>
<li><a href="https://github.com/z-galaxy/zbus/" target="_blank" rel="noopener">zvariant_derive v5.15.1</a></li>
</ul>
<pre class="license-text">Copyright (c) 2024 Zeeshan Ali Khan &amp; zbus contributors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/z-galaxy/zcheapstr/" target="_blank" rel="noopener">zcheapstr v1.2.0</a></li>
</ul>
<pre class="license-text">Copyright (c) 2026 Zeeshan Ali Khan &amp; zcheapstr contributors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-lang/annotate-snippets-rs" target="_blank" rel="noopener">annotate-snippets v0.12.17</a></li>
<li><a href="https://github.com/rust-cli/anstyle.git" target="_blank" rel="noopener">anstyle v1.0.14</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">serde_spanned v0.6.9</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">serde_spanned v1.1.3</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml v0.8.23</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml v1.2.1+spec-1.1.0</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml_datetime v0.6.11</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml_datetime v1.1.3+spec-1.1.0</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml_edit v0.19.15</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml_edit v0.20.7</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml_edit v0.22.27</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml_edit v0.25.17+spec-1.1.0</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml_parser v1.1.5+spec-1.1.0</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml_write v0.1.2</a></li>
<li><a href="https://github.com/toml-rs/toml" target="_blank" rel="noopener">toml_writer v1.2.0+spec-1.1.0</a></li>
</ul>
<pre class="license-text">Copyright (c) Individual contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/jhpratt/num-conv" target="_blank" rel="noopener">num-conv v0.2.2</a></li>
</ul>
<pre class="license-text">Copyright (c) Jacob Pratt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/time-rs/time" target="_blank" rel="noopener">time-core v0.1.9</a></li>
<li><a href="https://github.com/time-rs/time" target="_blank" rel="noopener">time-macros v0.2.32</a></li>
<li><a href="https://github.com/time-rs/time" target="_blank" rel="noopener">time v0.3.55</a></li>
</ul>
<pre class="license-text">Copyright (c) Jacob Pratt et al.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-lang/libc" target="_blank" rel="noopener">libc v0.2.191</a></li>
</ul>
<pre class="license-text">Copyright (c) The Rust Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/hsivonen/idna_adapter" target="_blank" rel="noopener">idna_adapter v1.2.2</a></li>
</ul>
<pre class="license-text">Copyright (c) The rust-url developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/bluss/arrayvec" target="_blank" rel="noopener">arrayvec v0.7.8</a></li>
</ul>
<pre class="license-text">Copyright (c) Ulrik Sverdrup &quot;bluss&quot; 2015-2023

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/mystor/synstructure" target="_blank" rel="noopener">synstructure v0.14.0</a></li>
</ul>
<pre class="license-text">Copyright 2016 Nika Layzell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/krisprice/ipnet" target="_blank" rel="noopener">ipnet v2.12.2</a></li>
</ul>
<pre class="license-text">Copyright 2017 Juniper Networks, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-random/rand" target="_blank" rel="noopener">rand v0.9.5</a></li>
<li><a href="https://github.com/rust-random/rand" target="_blank" rel="noopener">rand_chacha v0.9.0</a></li>
<li><a href="https://github.com/rust-random/rand" target="_blank" rel="noopener">rand_core v0.9.5</a></li>
</ul>
<pre class="license-text">Copyright 2018 Developers of the Rand project
Copyright (c) 2014 The Rust Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/paritytech/nohash-hasher" target="_blank" rel="noopener">nohash-hasher v0.2.0</a></li>
</ul>
<pre class="license-text">Copyright 2018 Parity Technologies (UK) Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the &quot;Software&quot;), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/calebzulawski/multiversion" target="_blank" rel="noopener">multiversion-macros v0.9.2</a></li>
<li><a href="https://github.com/calebzulawski/multiversion" target="_blank" rel="noopener">multiversion v0.9.2</a></li>
</ul>
<pre class="license-text">Copyright 2019 Caleb Zulawski

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-windowing/softbuffer" target="_blank" rel="noopener">softbuffer v0.4.8</a></li>
</ul>
<pre class="license-text">Copyright 2022 Kirill Chibisov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/google/zerocopy" target="_blank" rel="noopener">zerocopy-derive v0.8.63</a></li>
                    <li><a href="https://github.com/google/zerocopy" target="_blank" rel="noopener">zerocopy v0.8.63</a></li>
                </ul>
                <pre class="license-text">Copyright 2023 The Fuchsia Authors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/hsivonen/encoding_rs" target="_blank" rel="noopener">encoding_rs v0.8.44</a></li>
                    <li><a href="https://github.com/hsivonen/multiversion_no_op" target="_blank" rel="noopener">multiversion_no_op v1.0.0</a></li>
                    <li><a href="https://github.com/hsivonen/utf8_iter" target="_blank" rel="noopener">utf8_iter v1.1.0</a></li>
                    <li><a href="https://github.com/hsivonen/utf_types" target="_blank" rel="noopener">utf_types v1.0.0</a></li>
                </ul>
                <pre class="license-text">Copyright Mozilla Foundation

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/pdf-rs/fax" target="_blank" rel="noopener">fax v0.2.7</a></li>
</ul>
<pre class="license-text">Copyright © 2021 The pdf-rs contributers.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/Diggsey/rust-field-offset" target="_blank" rel="noopener">field-offset v0.3.6</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2016-2021 Diggory Blake, and other contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tauri-apps/tauri" target="_blank" rel="noopener">tauri-build v2.7.4</a></li>
<li><a href="https://github.com/tauri-apps/tauri" target="_blank" rel="noopener">tauri-codegen v2.7.4</a></li>
<li><a href="https://github.com/tauri-apps/tauri" target="_blank" rel="noopener">tauri-macros v2.7.4</a></li>
<li><a href="https://github.com/tauri-apps/tauri" target="_blank" rel="noopener">tauri-runtime-wry v2.12.3</a></li>
<li><a href="https://github.com/tauri-apps/tauri" target="_blank" rel="noopener">tauri-runtime v2.12.2</a></li>
<li><a href="https://github.com/tauri-apps/tauri" target="_blank" rel="noopener">tauri-utils v2.10.2</a></li>
<li><a href="https://github.com/tauri-apps/tauri" target="_blank" rel="noopener">tauri v2.12.5</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2017 - Present Tauri Apps Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/webdesus/fs_extra" target="_blank" rel="noopener">fs_extra v1.3.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2017 Denis Kurilenko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/emilio/precomputed-hash" target="_blank" rel="noopener">precomputed-hash v0.1.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2017 Emilio Cobos Álvarez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/idubrov/json-patch" target="_blank" rel="noopener">json-patch v4.2.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2017 Ivan Dubrov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/mdsteele/rust-cfb" target="_blank" rel="noopener">cfb v0.14.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2017 Matthew D. Steele

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/TedDriggs/darling" target="_blank" rel="noopener">darling v0.23.0</a></li>
<li><a href="https://github.com/TedDriggs/darling" target="_blank" rel="noopener">darling v0.24.1</a></li>
<li><a href="https://github.com/TedDriggs/darling" target="_blank" rel="noopener">darling_core v0.23.0</a></li>
<li><a href="https://github.com/TedDriggs/darling" target="_blank" rel="noopener">darling_core v0.24.1</a></li>
<li><a href="https://github.com/TedDriggs/darling" target="_blank" rel="noopener">darling_macro v0.23.0</a></li>
<li><a href="https://github.com/TedDriggs/darling" target="_blank" rel="noopener">darling_macro v0.24.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2017 Ted Driggs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://crates.io/crates/libappindicator" target="_blank" rel="noopener">libappindicator v0.9.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2017-2021 qDot
Copyright (c) 2021 Tauri Apps Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/lukaslueg/built" target="_blank" rel="noopener">built v0.8.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2017-2023 Lukas Lueg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/lu-zero/arg_enum_proc_macro" target="_blank" rel="noopener">arg_enum_proc_macro v0.3.4</a></li>
<li><a href="https://github.com/lu-zero/interpolate_name" target="_blank" rel="noopener">interpolate_name v0.2.4</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2018 Luca Barbato

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/mdsteele/rust-ico" target="_blank" rel="noopener">ico v0.6.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2018 Matthew D. Steele

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/image-rs/image-tiff" target="_blank" rel="noopener">tiff v0.11.3</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2018 PistonDevelopers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/srijs/rust-crc32fast" target="_blank" rel="noopener">crc32fast v1.5.4</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2018 Sam Rijs, Alex Crichton and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/bojand/infer" target="_blank" rel="noopener">infer v0.22.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2019 Bojan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/Lokathor/bytemuck" target="_blank" rel="noopener">bytemuck v1.25.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2019 Daniel &quot;Lokathor&quot; Gee.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice (including the next paragraph) shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/GREsau/schemars" target="_blank" rel="noopener">schemars v0.8.22</a></li>
<li><a href="https://github.com/GREsau/schemars" target="_blank" rel="noopener">schemars_derive v0.8.22</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2019 Graham Esau

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/kornelski/rust-rgb" target="_blank" rel="noopener">rgb v0.8.53</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2019 Kornel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/lu-zero/noop_proc_macro" target="_blank" rel="noopener">noop_proc_macro v0.3.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2019 Luca Barbato

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-fuzz/arbitrary/" target="_blank" rel="noopener">arbitrary v1.5.0</a></li>
<li><a href="https://github.com/Manishearth/triomphe" target="_blank" rel="noopener">triomphe v0.1.17</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2019 Manish Goregaokar

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-av/av-scenechange" target="_blank" rel="noopener">av-scenechange v0.14.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2019 Multimedia and Rust

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-windowing/raw-window-handle" target="_blank" rel="noopener">raw-window-handle v0.6.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2019 Osspial

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tokio-rs/tokio" target="_blank" rel="noopener">tokio-macros v2.7.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2019 Yoshua Wuyts
Copyright (c) Tokio Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://gitlab.com/CreepySkeleton/proc-macro-error" target="_blank" rel="noopener">proc-macro-error-attr v1.0.4</a></li>
<li><a href="https://gitlab.com/CreepySkeleton/proc-macro-error" target="_blank" rel="noopener">proc-macro-error v1.0.4</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2019-2020 CreepySkeleton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/PolyMeilex/rfd" target="_blank" rel="noopener">rfd v0.17.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2020 Bilal Elmoussaoui

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/katharostech/cfg_aliases" target="_blank" rel="noopener">cfg_aliases v0.2.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2020 Katharos Technology

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/nvzqz/embed-plist-rs" target="_blank" rel="noopener">embed_plist v1.2.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2020 Nikolai Vazquez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/dylni/normpath" target="_blank" rel="noopener">normpath v1.5.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2020 dylni (https://github.com/dylni)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tauri-apps/tauri-plugin-vibrancy" target="_blank" rel="noopener">window-vibrancy v0.8.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2020-2022 Tauri Programme within The Commons Conservancy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tauri-apps/wry" target="_blank" rel="noopener">wry v0.57.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2020-2023 Ngo Iok Ui &amp; Tauri Programme within The Commons Conservancy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/1Password/sys-locale" target="_blank" rel="noopener">sys-locale v0.3.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2021 1Password

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/chippers/serialize-to-javascript" target="_blank" rel="noopener">serialize-to-javascript-impl v0.1.2</a></li>
<li><a href="https://github.com/chippers/serialize-to-javascript" target="_blank" rel="noopener">serialize-to-javascript v0.1.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2021 Chip Reed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/ChrisDenton/static_vcruntime" target="_blank" rel="noopener">static_vcruntime v3.0.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2021 Chris Denton.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice (including the next paragraph) shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/shssoichiro/maybe-rayon" target="_blank" rel="noopener">maybe-rayon v0.1.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2021 Joshua Holmer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/longbridge/rust-i18n" target="_blank" rel="noopener">rust-i18n v4.2.4</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2021 Longbridge

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/sarah-quinones/pulp/" target="_blank" rel="noopener">pulp v0.22.3</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2021 sarah

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/denoland/rust-urlpattern" target="_blank" rel="noopener">urlpattern v0.6.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2021 the Deno authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tauri-apps/tao" target="_blank" rel="noopener">tao-macros v0.1.4</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2022 - Present Tauri Apps Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rustls/rustls-platform-verifier" target="_blank" rel="noopener">rustls-platform-verifier v0.7.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2022 1Password

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/PolyMeilex/rfd" target="_blank" rel="noopener">rfd v0.17.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2022 Bartłomiej Maryńczak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/chanced/jsonptr" target="_blank" rel="noopener">jsonptr v0.7.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2022 Chance Dinkins

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/sarah-ek/aligned-vec/" target="_blank" rel="noopener">aligned-vec v0.6.4</a></li>
<li><a href="https://github.com/sarah-ek/reborrow/" target="_blank" rel="noopener">reborrow v0.5.5</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2022 sarah

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tauri-apps/muda" target="_blank" rel="noopener">muda v0.20.0</a></li>
<li><a href="https://github.com/tauri-apps/tray-icon" target="_blank" rel="noopener">tray-icon v0.25.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2022-2022 Tauri Programme within The Commons Conservancy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://gitlab.redox-os.org/redox-os/libredox.git" target="_blank" rel="noopener">libredox v0.1.25</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2023 4lDO2

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/niklak/dom_query" target="_blank" rel="noopener">dom_query v0.28.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2023 Mykola Humanov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

This project contains portions of code and architectural concepts originally
derived from the &quot;nipper&quot; project (https://github.com/importcjj/nipper),
developed by Chen Jiaju, licensed under the MIT License and the Apache License 2.0 (dual licensed).</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/TheLarkInn/is-docker" target="_blank" rel="noopener">is-docker v0.2.0</a></li>
<li><a href="https://github.com/TheLarkInn/is-wsl" target="_blank" rel="noopener">is-wsl v0.4.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2023 Sean Larkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/daxpedda/web-time" target="_blank" rel="noopener">web-time v1.1.0</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2023 dAxpeDDa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/sarah-ek/equator/" target="_blank" rel="noopener">equator-macro v0.4.2</a></li>
<li><a href="https://github.com/sarah-ek/equator/" target="_blank" rel="noopener">equator v0.4.2</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) 2023 sarah

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-windowing/winit" target="_blank" rel="noopener">dpi v0.1.2</a></li>
<li><a href="https://crates.io/crates/nanai-core" target="_blank" rel="noopener">nanai-core v0.1.0</a></li>
<li><a href="https://crates.io/crates/nanai-shiori-vm" target="_blank" rel="noopener">nanai-shiori-vm v0.1.0</a></li>
<li><a href="https://crates.io/crates/nanai-surface" target="_blank" rel="noopener">nanai-surface v0.1.0</a></li>
<li><a href="https://crates.io/crates/nanai-vfs" target="_blank" rel="noopener">nanai-vfs v0.1.0</a></li>
<li><a href="https://crates.io/crates/nanai-android-mascot-ui" target="_blank" rel="noopener">nanai-android-mascot-ui v0.1.0</a></li>
<li><a href="https://crates.io/crates/nanai-android-mascot" target="_blank" rel="noopener">nanai-android-mascot v0.1.0</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">block2 v0.6.2</a></li>
<li><a href="https://github.com/dropbox/rust-brotli-decompressor" target="_blank" rel="noopener">brotli-decompressor v6.2.0</a></li>
<li><a href="https://gitlab.com/lib.rs/cargo_toml" target="_blank" rel="noopener">cargo_toml v1.0.1</a></li>
<li><a href="https://github.com/emk/cesu8-rs" target="_blank" rel="noopener">cesu8 v1.1.0</a></li>
<li><a href="https://github.com/chronotope/chrono" target="_blank" rel="noopener">chrono v0.4.45</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">dispatch2 v0.3.1</a></li>
<li><a href="https://github.com/OpenByteDev/dlopen2" target="_blank" rel="noopener">dlopen2 v0.8.2</a></li>
<li><a href="https://github.com/OpenByteDev/dlopen2" target="_blank" rel="noopener">dlopen2_derive v0.4.3</a></li>
<li><a href="https://github.com/bourumir-wyngs/granit-parser" target="_blank" rel="noopener">granit-parser v1.3.0</a></li>
<li><a href="https://github.com/jni-rs/jni-rs" target="_blank" rel="noopener">jni-macros v0.22.4</a></li>
<li><a href="https://github.com/jni-rs/jni-sys" target="_blank" rel="noopener">jni-sys-macros v0.4.1</a></li>
<li><a href="https://github.com/jni-rs/jni-rs" target="_blank" rel="noopener">jni v0.22.4</a></li>
<li><a href="https://crates.io/crates/libappindicator-sys" target="_blank" rel="noopener">libappindicator-sys v0.9.0</a></li>
<li><a href="https://github.com/rust-lang/compiler-builtins" target="_blank" rel="noopener">libm v0.2.16</a></li>
<li><a href="https://github.com/rust-windowing/android-ndk-rs" target="_blank" rel="noopener">ndk-context v0.1.1</a></li>
<li><a href="https://github.com/rust-mobile/ndk" target="_blank" rel="noopener">ndk-sys v0.6.0+11769913</a></li>
<li><a href="https://github.com/rust-mobile/ndk" target="_blank" rel="noopener">ndk v0.9.0</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-app-kit v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-cloud-kit v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-core-data v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-core-foundation v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-core-graphics v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-core-image v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-core-location v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-core-text v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-encode v4.1.0</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-exception-helper v0.1.1</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-foundation v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-quartz-core v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-ui-kit v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-user-notifications v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2-web-kit v0.3.2</a></li>
<li><a href="https://github.com/madsmtm/objc2" target="_blank" rel="noopener">objc2 v0.6.5</a></li>
<li><a href="https://github.com/aclysma/profiling" target="_blank" rel="noopener">profiling-procmacros v1.0.18</a></li>
<li><a href="https://github.com/aclysma/profiling" target="_blank" rel="noopener">profiling v1.0.18</a></li>
<li><a href="https://github.com/sarah-quinones/pulp/" target="_blank" rel="noopener">pulp-wasm-simd-flag v0.1.1</a></li>
<li><a href="https://github.com/r-efi/r-efi" target="_blank" rel="noopener">r-efi v5.3.0</a></li>
<li><a href="https://github.com/r-efi/r-efi" target="_blank" rel="noopener">r-efi v6.0.0</a></li>
<li><a href="https://github.com/longbridge/rust-i18n" target="_blank" rel="noopener">rust-i18n-macro v4.2.4</a></li>
<li><a href="https://github.com/longbridge/rust-i18n" target="_blank" rel="noopener">rust-i18n-support v4.2.4</a></li>
<li><a href="https://github.com/rustls/rustls-platform-verifier" target="_blank" rel="noopener">rustls-platform-verifier-android v0.2.0</a></li>
<li><a href="https://github.com/lu-zero/simd_helpers" target="_blank" rel="noopener">simd_helpers v0.1.0</a></li>
<li><a href="https://github.com/specta-rs/specta" target="_blank" rel="noopener">specta-macros v2.0.0-rc.25</a></li>
<li><a href="https://github.com/specta-rs/specta" target="_blank" rel="noopener">specta-serde v0.0.12</a></li>
<li><a href="https://github.com/specta-rs/specta" target="_blank" rel="noopener">specta-typescript v0.0.12</a></li>
<li><a href="https://github.com/specta-rs/specta" target="_blank" rel="noopener">specta-util v0.0.12</a></li>
<li><a href="https://github.com/specta-rs/specta" target="_blank" rel="noopener">specta v2.0.0-rc.25</a></li>
<li><a href="https://github.com/tauri-apps/plugins-workspace" target="_blank" rel="noopener">tauri-plugin-dialog v2.8.4</a></li>
<li><a href="https://github.com/tauri-apps/plugins-workspace" target="_blank" rel="noopener">tauri-plugin-fs v2.7.1</a></li>
<li><a href="https://github.com/tauri-apps/plugins-workspace" target="_blank" rel="noopener">tauri-plugin-opener v2.7.3</a></li>
<li><a href="https://github.com/tauri-apps/tauri" target="_blank" rel="noopener">tauri-plugin v2.7.2</a></li>
<li><a href="https://github.com/specta-rs/tauri-specta" target="_blank" rel="noopener">tauri-specta-macros v2.0.0-rc.25</a></li>
<li><a href="https://github.com/specta-rs/tauri-specta" target="_blank" rel="noopener">tauri-specta v2.0.0-rc.25</a></li>
<li><a href="https://github.com/wasmi-labs/wasmi" target="_blank" rel="noopener">wasmi v2.0.0</a></li>
<li><a href="https://github.com/wasmi-labs/wasmi" target="_blank" rel="noopener">wasmi_collections v2.0.0</a></li>
<li><a href="https://github.com/wasmi-labs/wasmi" target="_blank" rel="noopener">wasmi_core v2.0.0</a></li>
<li><a href="https://github.com/wasmi-labs/wasmi" target="_blank" rel="noopener">wasmi_ir v2.0.0</a></li>
<li><a href="https://github.com/bytecodealliance/wasm-tools/tree/main/crates/wasmparser" target="_blank" rel="noopener">wasmparser v0.228.0</a></li>
<li><a href="https://github.com/wravery/webview2-rs" target="_blank" rel="noopener">webview2-com-macros v0.8.1</a></li>
<li><a href="https://github.com/wravery/webview2-rs" target="_blank" rel="noopener">webview2-com-sys v0.39.1</a></li>
<li><a href="https://github.com/wravery/webview2-rs" target="_blank" rel="noopener">webview2-com v0.39.1</a></li>
<li><a href="https://github.com/retep998/winapi-rs" target="_blank" rel="noopener">winapi-i686-pc-windows-gnu v0.4.0</a></li>
<li><a href="https://github.com/retep998/winapi-rs" target="_blank" rel="noopener">winapi-x86_64-pc-windows-gnu v0.4.0</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-collections v0.3.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-core v0.62.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-future v0.3.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-implement v0.60.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-interface v0.59.3</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-link v0.2.1</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-numerics v0.3.1</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-registry v0.6.1</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-result v0.4.1</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-strings v0.5.1</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-sys v0.45.0</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-sys v0.61.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-targets v0.42.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-threading v0.2.1</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows-version v0.1.7</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows v0.62.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows_aarch64_gnullvm v0.42.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows_aarch64_msvc v0.42.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows_i686_gnu v0.42.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows_i686_msvc v0.42.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows_x86_64_gnu v0.42.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows_x86_64_gnullvm v0.42.2</a></li>
<li><a href="https://github.com/microsoft/windows-rs" target="_blank" rel="noopener">windows_x86_64_msvc v0.42.2</a></li>
<li><a href="https://crates.io/crates/zune-inflate" target="_blank" rel="noopener">zune-inflate v0.2.54</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) &lt;year&gt; &lt;copyright holders&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tokio-rs/tokio" target="_blank" rel="noopener">tokio-util v0.7.20</a></li>
<li><a href="https://github.com/tokio-rs/tokio" target="_blank" rel="noopener">tokio v1.54.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) Tokio Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/mcountryman/simd-adler32" target="_blank" rel="noopener">simd-adler32 v0.3.10</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) [2021] [Marvin Countryman]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/etemesi254/zune-image" target="_blank" rel="noopener">zune-core v0.5.3</a></li>
<li><a href="https://github.com/etemesi254/zune-image/tree/dev/crates/zune-jpeg" target="_blank" rel="noopener">zune-jpeg v0.5.15</a></li>
</ul>
<pre class="license-text">MIT License

Copyright (c) zune-image developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide" target="_blank" rel="noopener">miniz_oxide v0.8.9</a></li>
<li><a href="https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide" target="_blank" rel="noopener">miniz_oxide v0.9.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright 2013-2014 RAD Game Tools and Valve Software
Copyright 2010-2014 Rich Geldreich and Tenacious Software LLC
Copyright (c) 2017 Frommi
Copyright (c) 2017-2024 oyvindln


Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide" target="_blank" rel="noopener">miniz_oxide v0.8.9</a></li>
<li><a href="https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide" target="_blank" rel="noopener">miniz_oxide v0.9.1</a></li>
</ul>
<pre class="license-text">MIT License

Copyright 2013-2014 RAD Game Tools and Valve Software
Copyright 2010-2014 Rich Geldreich and Tenacious Software LLC
Copyright (c) 2017 Frommi
Copyright (c) 2017-2024 oyvindln

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/image-rs/fdeflate" target="_blank" rel="noopener">fdeflate v0.3.7</a></li>
<li><a href="https://github.com/image-rs/image-webp" target="_blank" rel="noopener">image-webp v0.2.4</a></li>
<li><a href="https://github.com/image-rs/image" target="_blank" rel="noopener">image v0.25.10</a></li>
</ul>
<pre class="license-text">MIT License

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rusticstuff/simdutf8" target="_blank" rel="noopener">simdutf8 v0.1.5</a></li>
</ul>
<pre class="license-text">MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/VoidStarKat/half-rs" target="_blank" rel="noopener">half v2.7.1</a></li>
<li><a href="https://github.com/TedDriggs/ident_case" target="_blank" rel="noopener">ident_case v1.0.1</a></li>
</ul>
<pre class="license-text">MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-lang/rustc-hash" target="_blank" rel="noopener">rustc-hash v2.1.3</a></li>
</ul>
<pre class="license-text">Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/oyvindln/adler2" target="_blank" rel="noopener">adler2 v2.0.1</a></li>
<li><a href="https://github.com/dtolnay/anyhow" target="_blank" rel="noopener">anyhow v1.0.104</a></li>
<li><a href="https://github.com/smol-rs/async-channel" target="_blank" rel="noopener">async-channel v2.5.0</a></li>
<li><a href="https://github.com/smol-rs/async-executor" target="_blank" rel="noopener">async-executor v1.14.0</a></li>
<li><a href="https://github.com/smol-rs/async-io" target="_blank" rel="noopener">async-io v2.6.0</a></li>
<li><a href="https://github.com/smol-rs/async-lock" target="_blank" rel="noopener">async-lock v3.4.2</a></li>
<li><a href="https://github.com/smol-rs/async-process" target="_blank" rel="noopener">async-process v2.5.0</a></li>
<li><a href="https://github.com/smol-rs/async-signal" target="_blank" rel="noopener">async-signal v0.2.14</a></li>
<li><a href="https://github.com/smol-rs/async-task" target="_blank" rel="noopener">async-task v4.7.1</a></li>
<li><a href="https://github.com/dtolnay/async-trait" target="_blank" rel="noopener">async-trait v0.1.92</a></li>
<li><a href="https://github.com/smol-rs/atomic-waker" target="_blank" rel="noopener">atomic-waker v1.1.2</a></li>
<li><a href="https://github.com/smol-rs/blocking" target="_blank" rel="noopener">blocking v1.7.0</a></li>
<li><a href="https://github.com/camino-rs/camino" target="_blank" rel="noopener">camino v1.2.6</a></li>
<li><a href="https://github.com/rust-lang/cargo" target="_blank" rel="noopener">cargo-platform v0.1.9</a></li>
<li><a href="https://github.com/oli-obk/cargo_metadata" target="_blank" rel="noopener">cargo_metadata v0.19.2</a></li>
<li><a href="https://github.com/smol-rs/concurrent-queue" target="_blank" rel="noopener">concurrent-queue v2.5.0</a></li>
<li><a href="https://github.com/yaahc/displaydoc" target="_blank" rel="noopener">displaydoc v0.2.7</a></li>
<li><a href="https://github.com/dtolnay/dtoa" target="_blank" rel="noopener">dtoa v1.0.11</a></li>
<li><a href="https://github.com/dtolnay/dyn-clone" target="_blank" rel="noopener">dyn-clone v1.0.20</a></li>
<li><a href="https://github.com/zeenix/endi" target="_blank" rel="noopener">endi v1.1.1</a></li>
<li><a href="https://github.com/dtolnay/erased-serde" target="_blank" rel="noopener">erased-serde v0.4.11</a></li>
<li><a href="https://github.com/smol-rs/event-listener-strategy" target="_blank" rel="noopener">event-listener-strategy v0.5.4</a></li>
<li><a href="https://github.com/smol-rs/event-listener" target="_blank" rel="noopener">event-listener v5.4.2</a></li>
<li><a href="https://github.com/smol-rs/fastrand" target="_blank" rel="noopener">fastrand v2.5.0</a></li>
<li><a href="https://github.com/smol-rs/futures-lite" target="_blank" rel="noopener">futures-lite v2.6.1</a></li>
<li><a href="https://github.com/hermit-os/hermit-rs" target="_blank" rel="noopener">hermit-abi v0.5.3</a></li>
<li><a href="https://github.com/dtolnay/itoa" target="_blank" rel="noopener">itoa v1.0.18</a></li>
<li><a href="https://github.com/bluk/leb128fmt" target="_blank" rel="noopener">leb128fmt v0.1.0</a></li>
<li><a href="https://github.com/sunfishcode/linux-raw-sys" target="_blank" rel="noopener">linux-raw-sys v0.12.1</a></li>
<li><a href="https://github.com/illicitonion/num_enum" target="_blank" rel="noopener">num_enum v0.7.6</a></li>
<li><a href="https://github.com/illicitonion/num_enum" target="_blank" rel="noopener">num_enum_derive v0.7.6</a></li>
<li><a href="https://github.com/matklad/once_cell" target="_blank" rel="noopener">once_cell v1.21.4</a></li>
<li><a href="https://github.com/danieldg/ordered-stream" target="_blank" rel="noopener">ordered-stream v0.2.0</a></li>
<li><a href="https://github.com/smol-rs/parking" target="_blank" rel="noopener">parking v2.2.1</a></li>
<li><a href="https://github.com/dtolnay/paste" target="_blank" rel="noopener">paste v1.0.15</a></li>
<li><a href="https://github.com/as1100k/pastey" target="_blank" rel="noopener">pastey v0.1.1</a></li>
<li><a href="https://github.com/taiki-e/pin-project-lite" target="_blank" rel="noopener">pin-project-lite v0.2.17</a></li>
<li><a href="https://github.com/smol-rs/piper" target="_blank" rel="noopener">piper v0.2.5</a></li>
<li><a href="https://github.com/smol-rs/polling" target="_blank" rel="noopener">polling v3.11.0</a></li>
<li><a href="https://github.com/bkchr/proc-macro-crate" target="_blank" rel="noopener">proc-macro-crate v1.3.1</a></li>
<li><a href="https://github.com/bkchr/proc-macro-crate" target="_blank" rel="noopener">proc-macro-crate v2.0.0</a></li>
<li><a href="https://github.com/bkchr/proc-macro-crate" target="_blank" rel="noopener">proc-macro-crate v3.5.0</a></li>
<li><a href="https://github.com/dtolnay/proc-macro2" target="_blank" rel="noopener">proc-macro2 v1.0.107</a></li>
<li><a href="https://github.com/dtolnay/quote" target="_blank" rel="noopener">quote v1.0.47</a></li>
<li><a href="https://github.com/bytecodealliance/rustix" target="_blank" rel="noopener">rustix v1.1.6</a></li>
<li><a href="https://github.com/dtolnay/rustversion" target="_blank" rel="noopener">rustversion v1.0.23</a></li>
<li><a href="https://github.com/dtolnay/semver" target="_blank" rel="noopener">semver v1.0.28</a></li>
<li><a href="https://github.com/bourumir-wyngs/serde-saphyr" target="_blank" rel="noopener">serde-saphyr v1.3.0</a></li>
<li><a href="https://github.com/dtolnay/serde-untagged" target="_blank" rel="noopener">serde-untagged v0.1.9</a></li>
<li><a href="https://github.com/serde-rs/serde" target="_blank" rel="noopener">serde v1.0.229</a></li>
<li><a href="https://github.com/serde-rs/serde" target="_blank" rel="noopener">serde_core v1.0.229</a></li>
<li><a href="https://github.com/serde-rs/serde" target="_blank" rel="noopener">serde_derive v1.0.229</a></li>
<li><a href="https://github.com/serde-rs/serde" target="_blank" rel="noopener">serde_derive_internals v0.29.1</a></li>
<li><a href="https://github.com/serde-rs/json" target="_blank" rel="noopener">serde_json v1.0.154</a></li>
<li><a href="https://github.com/dtolnay/serde-repr" target="_blank" rel="noopener">serde_repr v0.1.21</a></li>
<li><a href="https://github.com/servo/stylo" target="_blank" rel="noopener">servo_arc v0.4.3</a></li>
<li><a href="https://github.com/seancroach/simd_cesu8" target="_blank" rel="noopener">simd_cesu8 v1.2.0</a></li>
<li><a href="https://github.com/dtolnay/syn" target="_blank" rel="noopener">syn v1.0.109</a></li>
<li><a href="https://github.com/dtolnay/syn" target="_blank" rel="noopener">syn v2.0.119</a></li>
<li><a href="https://github.com/dtolnay/syn" target="_blank" rel="noopener">syn v3.0.9</a></li>
<li><a href="https://github.com/gdesmott/system-deps" target="_blank" rel="noopener">system-deps v6.2.2</a></li>
<li><a href="https://github.com/dtolnay/thiserror" target="_blank" rel="noopener">thiserror-impl v1.0.69</a></li>
<li><a href="https://github.com/dtolnay/thiserror" target="_blank" rel="noopener">thiserror-impl v2.0.21</a></li>
<li><a href="https://github.com/dtolnay/thiserror" target="_blank" rel="noopener">thiserror v1.0.69</a></li>
<li><a href="https://github.com/dtolnay/thiserror" target="_blank" rel="noopener">thiserror v2.0.21</a></li>
<li><a href="https://github.com/chipsenkbeil/typed-path" target="_blank" rel="noopener">typed-path v0.13.0</a></li>
<li><a href="https://github.com/dtolnay/typeid" target="_blank" rel="noopener">typeid v1.0.3</a></li>
<li><a href="https://github.com/dtolnay/unicode-ident" target="_blank" rel="noopener">unicode-ident v1.0.27</a></li>
<li><a href="https://github.com/bytecodealliance/wasi" target="_blank" rel="noopener">wasi v0.11.1+wasi-snapshot-preview1</a></li>
<li><a href="https://github.com/bytecodealliance/wasi-rs" target="_blank" rel="noopener">wasip2 v1.0.4+wasi-0.2.12</a></li>
<li><a href="https://github.com/bytecodealliance/wasm-tools/tree/main/crates/wasm-encoder" target="_blank" rel="noopener">wasm-encoder v0.263.0</a></li>
<li><a href="https://github.com/MattiasBuelens/wasm-streams/" target="_blank" rel="noopener">wasm-streams v0.5.0</a></li>
<li><a href="https://github.com/bytecodealliance/wasm-tools/tree/main/crates/wast" target="_blank" rel="noopener">wast v263.0.0</a></li>
<li><a href="https://github.com/bytecodealliance/wasm-tools/tree/main/crates/wat" target="_blank" rel="noopener">wat v1.263.0</a></li>
<li><a href="https://github.com/bytecodealliance/wit-bindgen" target="_blank" rel="noopener">wit-bindgen v0.57.1</a></li>
<li><a href="https://github.com/AltF02/x11-rs.git" target="_blank" rel="noopener">x11-dl v2.21.0</a></li>
<li><a href="https://github.com/AltF02/x11-rs.git" target="_blank" rel="noopener">x11 v2.21.0</a></li>
<li><a href="https://github.com/dtolnay/zmij" target="_blank" rel="noopener">zmij v1.0.23</a></li>
<li><a href="https://github.com/z-galaxy/zbus/" target="_blank" rel="noopener">zvariant_utils v4.2.0</a></li>
</ul>
<pre class="license-text">Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/dcchut/async-recursion" target="_blank" rel="noopener">async-recursion v1.2.0</a></li>
</ul>
<pre class="license-text">Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/winnow-rs/winnow" target="_blank" rel="noopener">winnow v0.5.40</a></li>
<li><a href="https://github.com/winnow-rs/winnow" target="_blank" rel="noopener">winnow v0.7.15</a></li>
<li><a href="https://github.com/winnow-rs/winnow" target="_blank" rel="noopener">winnow v1.0.4</a></li>
</ul>
<pre class="license-text">Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
&quot;Software&quot;), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/jedisct1/rust-siphash" target="_blank" rel="noopener">siphasher v1.0.4</a></li>
</ul>
<pre class="license-text">Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/gtk-rs/gtk3-rs" target="_blank" rel="noopener">atk-sys v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk3-rs" target="_blank" rel="noopener">atk v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">cairo-rs v0.18.5</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">cairo-sys-rs v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">gdk-pixbuf-sys v0.18.0</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">gdk-pixbuf v0.18.5</a></li>
<li><a href="https://github.com/gtk-rs/gtk3-rs" target="_blank" rel="noopener">gdk-sys v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk3-rs" target="_blank" rel="noopener">gdk v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk3-rs" target="_blank" rel="noopener">gdkwayland-sys v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk3-rs" target="_blank" rel="noopener">gdkx11-sys v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk3-rs" target="_blank" rel="noopener">gdkx11 v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">gio-sys v0.18.1</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">gio v0.18.4</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">glib-macros v0.18.5</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">glib-sys v0.18.1</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">glib v0.18.5</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">gobject-sys v0.18.0</a></li>
<li><a href="https://github.com/gtk-rs/gtk3-rs" target="_blank" rel="noopener">gtk-sys v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk3-rs" target="_blank" rel="noopener">gtk3-macros v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk3-rs" target="_blank" rel="noopener">gtk v0.18.2</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">pango-sys v0.18.0</a></li>
<li><a href="https://github.com/gtk-rs/gtk-rs-core" target="_blank" rel="noopener">pango v0.18.3</a></li>
</ul>
<pre class="license-text">Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/mmastrac/linktime" target="_blank" rel="noopener">ctor v1.0.13</a></li>
                </ul>
                <pre class="license-text">Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/nical/android_system_properties" target="_blank" rel="noopener">android_system_properties v0.1.6</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2013 Nicolas Silva

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the &quot;Software&quot;), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tauri-apps/javascriptcore-rs" target="_blank" rel="noopener">javascriptcore-rs-sys v1.1.1</a></li>
<li><a href="https://gitlab.gnome.org/World/Rust/soup3-rs" target="_blank" rel="noopener">soup3-sys v0.5.0</a></li>
<li><a href="https://gitlab.gnome.org/World/Rust/soup3-rs" target="_blank" rel="noopener">soup3 v0.5.0</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2013-2017, The Gtk-rs Project Developers.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/tauri-apps/javascriptcore-rs" target="_blank" rel="noopener">javascriptcore-rs v1.1.2</a></li>
                </ul>
                <pre class="license-text">The MIT License (MIT)

Copyright (c) 2013-2021, The Gtk-rs Project Developers.
Copyright (c) 2021, Tauri Programme within The Commons Conservancy.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/mvdnes/spin-rs.git" target="_blank" rel="noopener">spin v0.9.9</a></li>
                </ul>
                <pre class="license-text">The MIT License (MIT)

Copyright (c) 2014 Mathijs van de Nes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tokio-rs/tracing" target="_blank" rel="noopener">tracing-core v0.1.36</a></li>
<li><a href="https://github.com/zip-rs/zip2" target="_blank" rel="noopener">zip v9.5.1</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2014 Mathijs van de Nes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/paholg/typenum" target="_blank" rel="noopener">typenum v1.20.1</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2014 Paho Lurie-Gregg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-phf/rust-phf" target="_blank" rel="noopener">phf v0.13.1</a></li>
<li><a href="https://github.com/rust-phf/rust-phf" target="_blank" rel="noopener">phf_codegen v0.13.1</a></li>
<li><a href="https://github.com/rust-phf/rust-phf" target="_blank" rel="noopener">phf_generator v0.13.1</a></li>
<li><a href="https://github.com/rust-phf/rust-phf" target="_blank" rel="noopener">phf_macros v0.13.1</a></li>
<li><a href="https://github.com/rust-phf/rust-phf" target="_blank" rel="noopener">phf_shared v0.13.1</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2014-2022 Steven Fackler, Yuki Okushi

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the &quot;Software&quot;), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/marshallpierce/rust-base64" target="_blank" rel="noopener">base64 v0.21.7</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015 Alice Maz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/BurntSushi/aho-corasick" target="_blank" rel="noopener">aho-corasick v1.1.5</a></li>
<li><a href="https://github.com/image-rs/byteorder-lite" target="_blank" rel="noopener">byteorder-lite v0.1.0</a></li>
<li><a href="https://github.com/BurntSushi/byteorder" target="_blank" rel="noopener">byteorder v1.5.0</a></li>
<li><a href="https://github.com/BurntSushi/encoding_rs_io" target="_blank" rel="noopener">encoding_rs_io v0.1.8</a></li>
<li><a href="https://github.com/BurntSushi/ripgrep/tree/master/crates/globset" target="_blank" rel="noopener">globset v0.4.21</a></li>
<li><a href="https://github.com/BurntSushi/ripgrep/tree/master/crates/ignore" target="_blank" rel="noopener">ignore v0.4.34</a></li>
<li><a href="https://github.com/BurntSushi/memchr" target="_blank" rel="noopener">memchr v2.8.3</a></li>
<li><a href="https://github.com/BurntSushi/walkdir" target="_blank" rel="noopener">walkdir v2.5.0</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015 Andrew Gallant

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/nix-rust/nix" target="_blank" rel="noopener">nix v0.31.3</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015 Carl Lerche + nix-rust Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rapidfuzz/strsim-rs" target="_blank" rel="noopener">strsim v0.11.1</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015 Danny Guo
Copyright (c) 2016 Titus Wormer &lt;tituswormer@gmail.com&gt;
Copyright (c) 2018 Akash Kurdekar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/gz/rust-cpuid" target="_blank" rel="noopener">raw-cpuid v11.6.0</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015 Gerd Zellweger

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/Marwes/combine" target="_blank" rel="noopener">combine v4.6.9</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015 Markus Westerlind

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/comex/rust-shlex" target="_blank" rel="noopener">shlex v2.0.1</a></li>
                </ul>
                <pre class="license-text">The MIT License (MIT)

Copyright (c) 2015 Nicholas Allegra (comex).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/kornelski/rust-security-framework" target="_blank" rel="noopener">security-framework-sys v2.17.0</a></li>
<li><a href="https://github.com/kornelski/rust-security-framework" target="_blank" rel="noopener">security-framework v3.7.0</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015 Steven Fackler

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the &quot;Software&quot;), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/image-rs/image-gif" target="_blank" rel="noopener">gif v0.14.2</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015 nwin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/image-rs/y4m.git" target="_blank" rel="noopener">y4m v0.8.0</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015-2019 PistonDevelopers
Copyright (c) 2019 image-rs contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/aws/aws-lc-rs" target="_blank" rel="noopener">aws-lc-sys v0.47.0</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015-2020 the fiat-crypto authors (see
https://github.com/mit-plv/fiat-crypto/blob/master/AUTHORS).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/JelteF/derive_more" target="_blank" rel="noopener">derive_more-impl v2.1.1</a></li>
<li><a href="https://github.com/JelteF/derive_more" target="_blank" rel="noopener">derive_more v2.1.1</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2016 Jelte Fennema

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tafia/quick-xml" target="_blank" rel="noopener">quick-xml v0.42.0</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2016 Johann Tuffe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:


The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.


THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/phil-opp/rust-bit-field" target="_blank" rel="noopener">bit_field v0.10.3</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2016 Philipp Oppermann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/image-rs/color_quant.git" target="_blank" rel="noopener">color_quant v1.1.0</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2016 PistonDevelopers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/jni-rs/jni-rs" target="_blank" rel="noopener">jni v0.21.1</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2016 Prevoty, Inc. and jni-rs contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/BurntSushi/same-file" target="_blank" rel="noopener">same-file v1.0.6</a></li>
<li><a href="https://github.com/BurntSushi/winapi-util" target="_blank" rel="noopener">winapi-util v0.1.11</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2017 Andrew Gallant

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://gitlab.redox-os.org/redox-os/users" target="_blank" rel="noopener">redox_users v0.5.3</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2017 Jose Narvaez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/nabijaczleweli/rust-embed-resource" target="_blank" rel="noopener">embed-resource v3.0.12</a></li>
                </ul>
                <pre class="license-text">The MIT License (MIT)

Copyright (c) 2017 nabijaczleweli

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/andylokandy/arraydeque" target="_blank" rel="noopener">arraydeque v0.5.1</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2018 Andy Lok &lt;andylokandy@hotmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/BurntSushi/bstr" target="_blank" rel="noopener">bstr v1.13.1</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2018-2019 Andrew Gallant

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/crossbeam-rs/crossbeam" target="_blank" rel="noopener">crossbeam-channel v0.5.17</a></li>
<li><a href="https://github.com/crossbeam-rs/crossbeam" target="_blank" rel="noopener">crossbeam-deque v0.8.8</a></li>
<li><a href="https://github.com/crossbeam-rs/crossbeam" target="_blank" rel="noopener">crossbeam-epoch v0.9.21</a></li>
<li><a href="https://github.com/crossbeam-rs/crossbeam" target="_blank" rel="noopener">crossbeam-utils v0.8.23</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2019 The Crossbeam Project Developers

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/nabijaczleweli/vswhom-sys.rs" target="_blank" rel="noopener">vswhom-sys v0.1.3</a></li>
<li><a href="https://github.com/nabijaczleweli/vswhom.rs" target="_blank" rel="noopener">vswhom v0.1.0</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2019 nabijaczleweli

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/smol-rs/async-broadcast" target="_blank" rel="noopener">async-broadcast v0.7.2</a></li>
                </ul>
                <pre class="license-text">The MIT License (MIT)

Copyright (c) 2020 Yoshua Wuyts

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/tauri-apps/winres" target="_blank" rel="noopener">tauri-winres v0.3.7</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2023 - Present Tauri Apps Contributors
Copyright (c) 2016 Max Resch

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the &quot;Software&quot;), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/marshallpierce/rust-base64" target="_blank" rel="noopener">base64 v0.23.1</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2025 Alice Maz, Marshall Pierce

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/image-rs/weezl" target="_blank" rel="noopener">weezl v0.1.12</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) HeroicKatora 2020

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

</pre>
            </li>
            <li class="license">
                <h3 id="MIT">MIT License</h3>
                <p><strong>利用しているパッケージ (Used by):</strong></p>
                <ul class="license-used-by">
                    <li><a href="https://github.com/eira-fransham/crunchy" target="_blank" rel="noopener">crunchy v0.2.4</a></li>
                </ul>
                <pre class="license-text">The MIT License (MIT)

Copyright 2017-2023 Eira Fransham.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/Byron/open-rs" target="_blank" rel="noopener">open v5.4.5</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)
&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;

Copyright © &#x60;2015&#x60; &#x60;Sebastian Thiel&#x60;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/SergioBenitez/version_check" target="_blank" rel="noopener">version_check v0.9.5</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)
Copyright (c) 2017-2018 Sergio Benitez

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the &quot;Software&quot;), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/fizyk20/generic-array.git" target="_blank" rel="noopener">generic-array v0.14.7</a></li>
</ul>
<pre class="license-text">The MIT License (MIT)

Copyright (c) 2015 Bartłomiej Kamiński

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/kornelski/rust_urlencoding" target="_blank" rel="noopener">urlencoding v2.1.3</a></li>
</ul>
<pre class="license-text">© 2016 Bertram Truong
© 2021 Kornel Lesiński

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MIT">MIT License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://gitlab.com/kornelski/loop9.git" target="_blank" rel="noopener">loop9 v0.1.5</a></li>
</ul>
<pre class="license-text">© Kornel Lesiński

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="MPL-2.0">Mozilla Public License 2.0</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/upsuper/dtoa-short" target="_blank" rel="noopener">dtoa-short v0.3.5</a></li>
</ul>
<pre class="license-text">Mozilla Public License Version 2.0
&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;

1. Definitions

---

1.1. &quot;Contributor&quot;
means each individual or legal entity that creates, contributes to
the creation of, or owns Covered Software.

1.2. &quot;Contributor Version&quot;
means the combination of the Contributions of others (if any) used
by a Contributor and that particular Contributor&#x27;s Contribution.

1.3. &quot;Contribution&quot;
means Covered Software of a particular Contributor.

1.4. &quot;Covered Software&quot;
means Source Code Form to which the initial Contributor has attached
the notice in Exhibit A, the Executable Form of such Source Code
Form, and Modifications of such Source Code Form, in each case
including portions thereof.

1.5. &quot;Incompatible With Secondary Licenses&quot;
means

    (a) that the initial Contributor has attached the notice described
        in Exhibit B to the Covered Software; or

    (b) that the Covered Software was made available under the terms of
        version 1.1 or earlier of the License, but not also under the
        terms of a Secondary License.

1.6. &quot;Executable Form&quot;
means any form of the work other than Source Code Form.

1.7. &quot;Larger Work&quot;
means a work that combines Covered Software with other material, in
a separate file or files, that is not Covered Software.

1.8. &quot;License&quot;
means this document.

1.9. &quot;Licensable&quot;
means having the right to grant, to the maximum extent possible,
whether at the time of the initial grant or subsequently, any and
all of the rights conveyed by this License.

1.10. &quot;Modifications&quot;
means any of the following:

    (a) any file in Source Code Form that results from an addition to,
        deletion from, or modification of the contents of Covered
        Software; or

    (b) any new file in Source Code Form that contains any Covered
        Software.

1.11. &quot;Patent Claims&quot; of a Contributor
means any patent claim(s), including without limitation, method,
process, and apparatus claims, in any patent Licensable by such
Contributor that would be infringed, but for the grant of the
License, by the making, using, selling, offering for sale, having
made, import, or transfer of either its Contributions or its
Contributor Version.

1.12. &quot;Secondary License&quot;
means either the GNU General Public License, Version 2.0, the GNU
Lesser General Public License, Version 2.1, the GNU Affero General
Public License, Version 3.0, or any later versions of those
licenses.

1.13. &quot;Source Code Form&quot;
means the form of the work preferred for making modifications.

1.14. &quot;You&quot; (or &quot;Your&quot;)
means an individual or a legal entity exercising rights under this
License. For legal entities, &quot;You&quot; includes any entity that
controls, is controlled by, or is under common control with You. For
purposes of this definition, &quot;control&quot; means (a) the power, direct
or indirect, to cause the direction or management of such entity,
whether by contract or otherwise, or (b) ownership of more than
fifty percent (50%) of the outstanding shares or beneficial
ownership of such entity.

2. License Grants and Conditions

---

2.1. Grants

Each Contributor hereby grants You a world-wide, royalty-free,
non-exclusive license:

(a) under intellectual property rights (other than patent or trademark)
Licensable by such Contributor to use, reproduce, make available,
modify, display, perform, distribute, and otherwise exploit its
Contributions, either on an unmodified basis, with Modifications, or
as part of a Larger Work; and

(b) under Patent Claims of such Contributor to make, use, sell, offer
for sale, have made, import, and otherwise transfer either its
Contributions or its Contributor Version.

2.2. Effective Date

The licenses granted in Section 2.1 with respect to any Contribution
become effective for each Contribution on the date the Contributor first
distributes such Contribution.

2.3. Limitations on Grant Scope

The licenses granted in this Section 2 are the only rights granted under
this License. No additional rights or licenses will be implied from the
distribution or licensing of Covered Software under this License.
Notwithstanding Section 2.1(b) above, no patent license is granted by a
Contributor:

(a) for any code that a Contributor has removed from Covered Software;
or

(b) for infringements caused by: (i) Your and any other third party&#x27;s
modifications of Covered Software, or (ii) the combination of its
Contributions with other software (except as part of its Contributor
Version); or

(c) under Patent Claims infringed by Covered Software in the absence of
its Contributions.

This License does not grant any rights in the trademarks, service marks,
or logos of any Contributor (except as may be necessary to comply with
the notice requirements in Section 3.4).

2.4. Subsequent Licenses

No Contributor makes additional grants as a result of Your choice to
distribute the Covered Software under a subsequent version of this
License (see Section 10.2) or under the terms of a Secondary License (if
permitted under the terms of Section 3.3).

2.5. Representation

Each Contributor represents that the Contributor believes its
Contributions are its original creation(s) or it has sufficient rights
to grant the rights to its Contributions conveyed by this License.

2.6. Fair Use

This License is not intended to limit any rights You have under
applicable copyright doctrines of fair use, fair dealing, or other
equivalents.

2.7. Conditions

Sections 3.1, 3.2, 3.3, and 3.4 are conditions of the licenses granted
in Section 2.1.

3. Responsibilities

---

3.1. Distribution of Source Form

All distribution of Covered Software in Source Code Form, including any
Modifications that You create or to which You contribute, must be under
the terms of this License. You must inform recipients that the Source
Code Form of the Covered Software is governed by the terms of this
License, and how they can obtain a copy of this License. You may not
attempt to alter or restrict the recipients&#x27; rights in the Source Code
Form.

3.2. Distribution of Executable Form

If You distribute Covered Software in Executable Form then:

(a) such Covered Software must also be made available in Source Code
Form, as described in Section 3.1, and You must inform recipients of
the Executable Form how they can obtain a copy of such Source Code
Form by reasonable means in a timely manner, at a charge no more
than the cost of distribution to the recipient; and

(b) You may distribute such Executable Form under the terms of this
License, or sublicense it under different terms, provided that the
license for the Executable Form does not attempt to limit or alter
the recipients&#x27; rights in the Source Code Form under this License.

3.3. Distribution of a Larger Work

You may create and distribute a Larger Work under terms of Your choice,
provided that You also comply with the requirements of this License for
the Covered Software. If the Larger Work is a combination of Covered
Software with a work governed by one or more Secondary Licenses, and the
Covered Software is not Incompatible With Secondary Licenses, this
License permits You to additionally distribute such Covered Software
under the terms of such Secondary License(s), so that the recipient of
the Larger Work may, at their option, further distribute the Covered
Software under the terms of either this License or such Secondary
License(s).

3.4. Notices

You may not remove or alter the substance of any license notices
(including copyright notices, patent notices, disclaimers of warranty,
or limitations of liability) contained within the Source Code Form of
the Covered Software, except that You may alter any license notices to
the extent required to remedy known factual inaccuracies.

3.5. Application of Additional Terms

You may choose to offer, and to charge a fee for, warranty, support,
indemnity or liability obligations to one or more recipients of Covered
Software. However, You may do so only on Your own behalf, and not on
behalf of any Contributor. You must make it absolutely clear that any
such warranty, support, indemnity, or liability obligation is offered by
You alone, and You hereby agree to indemnify every Contributor for any
liability incurred by such Contributor as a result of warranty, support,
indemnity or liability terms You offer. You may include additional
disclaimers of warranty and limitations of liability specific to any
jurisdiction.

4. Inability to Comply Due to Statute or Regulation

---

If it is impossible for You to comply with any of the terms of this
License with respect to some or all of the Covered Software due to
statute, judicial order, or regulation then You must: (a) comply with
the terms of this License to the maximum extent possible; and (b)
describe the limitations and the code they affect. Such description must
be placed in a text file included with all distributions of the Covered
Software under this License. Except to the extent prohibited by statute
or regulation, such description must be sufficiently detailed for a
recipient of ordinary skill to be able to understand it.

5. Termination

---

5.1. The rights granted under this License will terminate automatically
if You fail to comply with any of its terms. However, if You become
compliant, then the rights granted under this License from a particular
Contributor are reinstated (a) provisionally, unless and until such
Contributor explicitly and finally terminates Your grants, and (b) on an
ongoing basis, if such Contributor fails to notify You of the
non-compliance by some reasonable means prior to 60 days after You have
come back into compliance. Moreover, Your grants from a particular
Contributor are reinstated on an ongoing basis if such Contributor
notifies You of the non-compliance by some reasonable means, this is the
first time You have received notice of non-compliance with this License
from such Contributor, and You become compliant prior to 30 days after
Your receipt of the notice.

5.2. If You initiate litigation against any entity by asserting a patent
infringement claim (excluding declaratory judgment actions,
counter-claims, and cross-claims) alleging that a Contributor Version
directly or indirectly infringes any patent, then the rights granted to
You by any and all Contributors for the Covered Software under Section
2.1 of this License shall terminate.

5.3. In the event of termination under Sections 5.1 or 5.2 above, all
end user license agreements (excluding distributors and resellers) which
have been validly granted by You or Your distributors under this License
prior to termination shall survive termination.

---

--
-  6. Disclaimer of Warranty *
-  ------------------------- *
--
-  Covered Software is provided under this License on an &quot;as is&quot; *
-  basis, without warranty of any kind, either expressed, implied, or *
-  statutory, including, without limitation, warranties that the *
-  Covered Software is free of defects, merchantable, fit for a *
-  particular purpose or non-infringing. The entire risk as to the *
-  quality and performance of the Covered Software is with You. *
-  Should any Covered Software prove defective in any respect, You *
-  (not any Contributor) assume the cost of any necessary servicing, *
-  repair, or correction. This disclaimer of warranty constitutes an *
-  essential part of this License. No use of any Covered Software is *
-  authorized under this License except under this disclaimer. *
--

---

---

--
-  7. Limitation of Liability *
-  -------------------------- *
--
-  Under no circumstances and under no legal theory, whether tort *
-  (including negligence), contract, or otherwise, shall any *
-  Contributor, or anyone who distributes Covered Software as *
-  permitted above, be liable to You for any direct, indirect, *
-  special, incidental, or consequential damages of any character *
-  including, without limitation, damages for lost profits, loss of *
-  goodwill, work stoppage, computer failure or malfunction, or any *
-  and all other commercial damages or losses, even if such party *
-  shall have been informed of the possibility of such damages. This *
-  limitation of liability shall not apply to liability for death or *
-  personal injury resulting from such party&#x27;s negligence to the *
-  extent applicable law prohibits such limitation. Some *
-  jurisdictions do not allow the exclusion or limitation of *
-  incidental or consequential damages, so this exclusion and *
-  limitation may not apply to You. *
--

---

8. Litigation

---

Any litigation relating to this License may be brought only in the
courts of a jurisdiction where the defendant maintains its principal
place of business and such litigation shall be governed by laws of that
jurisdiction, without reference to its conflict-of-law provisions.
Nothing in this Section shall prevent a party&#x27;s ability to bring
cross-claims or counter-claims.

9. Miscellaneous

---

This License represents the complete agreement concerning the subject
matter hereof. If any provision of this License is held to be
unenforceable, such provision shall be reformed only to the extent
necessary to make it enforceable. Any law or regulation which provides
that the language of a contract shall be construed against the drafter
shall not be used to construe this License against a Contributor.

10. Versions of the License

---

10.1. New Versions

Mozilla Foundation is the license steward. Except as provided in Section
10.3, no one other than the license steward has the right to modify or
publish new versions of this License. Each version will be given a
distinguishing version number.

10.2. Effect of New Versions

You may distribute the Covered Software under the terms of the version
of the License under which You originally received the Covered Software,
or under the terms of any subsequent version published by the license
steward.

10.3. Modified Versions

If you create software not governed by this License, and you want to
create a new license for such software, you may create and use a
modified version of this License if you rename the license and remove
any references to the name of the license steward (except to note that
such modified license differs from this License).

10.4. Distributing Source Code Form that is Incompatible With Secondary
Licenses

If You choose to distribute Source Code Form that is Incompatible With
Secondary Licenses under the terms of this version of the License, the
notice described in Exhibit B of this License must be attached.

## Exhibit A - Source Code Form License Notice

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.

If it is not possible or desirable to put the notice in a particular
file, then You may include the notice in a location (such as a LICENSE
file in a relevant directory) where a recipient would be likely to look
for such a notice.

You may add additional accurate notices of copyright ownership.

## Exhibit B - &quot;Incompatible With Secondary Licenses&quot; Notice

This Source Code Form is &quot;Incompatible With Secondary Licenses&quot;, as
defined by the Mozilla Public License, v. 2.0.
</pre>
</li>
<li class="license">
<h3 id="MPL-2.0">Mozilla Public License 2.0</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/servo/rust-cssparser" target="_blank" rel="noopener">cssparser-macros v0.7.1</a></li>
<li><a href="https://github.com/servo/rust-cssparser" target="_blank" rel="noopener">cssparser v0.37.0</a></li>
</ul>
<pre class="license-text">Mozilla Public License Version 2.0
&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;

1. Definitions

---

1.1. &quot;Contributor&quot;
means each individual or legal entity that creates, contributes to
the creation of, or owns Covered Software.

1.2. &quot;Contributor Version&quot;
means the combination of the Contributions of others (if any) used
by a Contributor and that particular Contributor&#x27;s Contribution.

1.3. &quot;Contribution&quot;
means Covered Software of a particular Contributor.

1.4. &quot;Covered Software&quot;
means Source Code Form to which the initial Contributor has attached
the notice in Exhibit A, the Executable Form of such Source Code
Form, and Modifications of such Source Code Form, in each case
including portions thereof.

1.5. &quot;Incompatible With Secondary Licenses&quot;
means

    (a) that the initial Contributor has attached the notice described
        in Exhibit B to the Covered Software; or

    (b) that the Covered Software was made available under the terms of
        version 1.1 or earlier of the License, but not also under the
        terms of a Secondary License.

1.6. &quot;Executable Form&quot;
means any form of the work other than Source Code Form.

1.7. &quot;Larger Work&quot;
means a work that combines Covered Software with other material, in
a separate file or files, that is not Covered Software.

1.8. &quot;License&quot;
means this document.

1.9. &quot;Licensable&quot;
means having the right to grant, to the maximum extent possible,
whether at the time of the initial grant or subsequently, any and
all of the rights conveyed by this License.

1.10. &quot;Modifications&quot;
means any of the following:

    (a) any file in Source Code Form that results from an addition to,
        deletion from, or modification of the contents of Covered
        Software; or

    (b) any new file in Source Code Form that contains any Covered
        Software.

1.11. &quot;Patent Claims&quot; of a Contributor
means any patent claim(s), including without limitation, method,
process, and apparatus claims, in any patent Licensable by such
Contributor that would be infringed, but for the grant of the
License, by the making, using, selling, offering for sale, having
made, import, or transfer of either its Contributions or its
Contributor Version.

1.12. &quot;Secondary License&quot;
means either the GNU General Public License, Version 2.0, the GNU
Lesser General Public License, Version 2.1, the GNU Affero General
Public License, Version 3.0, or any later versions of those
licenses.

1.13. &quot;Source Code Form&quot;
means the form of the work preferred for making modifications.

1.14. &quot;You&quot; (or &quot;Your&quot;)
means an individual or a legal entity exercising rights under this
License. For legal entities, &quot;You&quot; includes any entity that
controls, is controlled by, or is under common control with You. For
purposes of this definition, &quot;control&quot; means (a) the power, direct
or indirect, to cause the direction or management of such entity,
whether by contract or otherwise, or (b) ownership of more than
fifty percent (50%) of the outstanding shares or beneficial
ownership of such entity.

2. License Grants and Conditions

---

2.1. Grants

Each Contributor hereby grants You a world-wide, royalty-free,
non-exclusive license:

(a) under intellectual property rights (other than patent or trademark)
Licensable by such Contributor to use, reproduce, make available,
modify, display, perform, distribute, and otherwise exploit its
Contributions, either on an unmodified basis, with Modifications, or
as part of a Larger Work; and

(b) under Patent Claims of such Contributor to make, use, sell, offer
for sale, have made, import, and otherwise transfer either its
Contributions or its Contributor Version.

2.2. Effective Date

The licenses granted in Section 2.1 with respect to any Contribution
become effective for each Contribution on the date the Contributor first
distributes such Contribution.

2.3. Limitations on Grant Scope

The licenses granted in this Section 2 are the only rights granted under
this License. No additional rights or licenses will be implied from the
distribution or licensing of Covered Software under this License.
Notwithstanding Section 2.1(b) above, no patent license is granted by a
Contributor:

(a) for any code that a Contributor has removed from Covered Software;
or

(b) for infringements caused by: (i) Your and any other third party&#x27;s
modifications of Covered Software, or (ii) the combination of its
Contributions with other software (except as part of its Contributor
Version); or

(c) under Patent Claims infringed by Covered Software in the absence of
its Contributions.

This License does not grant any rights in the trademarks, service marks,
or logos of any Contributor (except as may be necessary to comply with
the notice requirements in Section 3.4).

2.4. Subsequent Licenses

No Contributor makes additional grants as a result of Your choice to
distribute the Covered Software under a subsequent version of this
License (see Section 10.2) or under the terms of a Secondary License (if
permitted under the terms of Section 3.3).

2.5. Representation

Each Contributor represents that the Contributor believes its
Contributions are its original creation(s) or it has sufficient rights
to grant the rights to its Contributions conveyed by this License.

2.6. Fair Use

This License is not intended to limit any rights You have under
applicable copyright doctrines of fair use, fair dealing, or other
equivalents.

2.7. Conditions

Sections 3.1, 3.2, 3.3, and 3.4 are conditions of the licenses granted
in Section 2.1.

3. Responsibilities

---

3.1. Distribution of Source Form

All distribution of Covered Software in Source Code Form, including any
Modifications that You create or to which You contribute, must be under
the terms of this License. You must inform recipients that the Source
Code Form of the Covered Software is governed by the terms of this
License, and how they can obtain a copy of this License. You may not
attempt to alter or restrict the recipients&#x27; rights in the Source Code
Form.

3.2. Distribution of Executable Form

If You distribute Covered Software in Executable Form then:

(a) such Covered Software must also be made available in Source Code
Form, as described in Section 3.1, and You must inform recipients of
the Executable Form how they can obtain a copy of such Source Code
Form by reasonable means in a timely manner, at a charge no more
than the cost of distribution to the recipient; and

(b) You may distribute such Executable Form under the terms of this
License, or sublicense it under different terms, provided that the
license for the Executable Form does not attempt to limit or alter
the recipients&#x27; rights in the Source Code Form under this License.

3.3. Distribution of a Larger Work

You may create and distribute a Larger Work under terms of Your choice,
provided that You also comply with the requirements of this License for
the Covered Software. If the Larger Work is a combination of Covered
Software with a work governed by one or more Secondary Licenses, and the
Covered Software is not Incompatible With Secondary Licenses, this
License permits You to additionally distribute such Covered Software
under the terms of such Secondary License(s), so that the recipient of
the Larger Work may, at their option, further distribute the Covered
Software under the terms of either this License or such Secondary
License(s).

3.4. Notices

You may not remove or alter the substance of any license notices
(including copyright notices, patent notices, disclaimers of warranty,
or limitations of liability) contained within the Source Code Form of
the Covered Software, except that You may alter any license notices to
the extent required to remedy known factual inaccuracies.

3.5. Application of Additional Terms

You may choose to offer, and to charge a fee for, warranty, support,
indemnity or liability obligations to one or more recipients of Covered
Software. However, You may do so only on Your own behalf, and not on
behalf of any Contributor. You must make it absolutely clear that any
such warranty, support, indemnity, or liability obligation is offered by
You alone, and You hereby agree to indemnify every Contributor for any
liability incurred by such Contributor as a result of warranty, support,
indemnity or liability terms You offer. You may include additional
disclaimers of warranty and limitations of liability specific to any
jurisdiction.

4. Inability to Comply Due to Statute or Regulation

---

If it is impossible for You to comply with any of the terms of this
License with respect to some or all of the Covered Software due to
statute, judicial order, or regulation then You must: (a) comply with
the terms of this License to the maximum extent possible; and (b)
describe the limitations and the code they affect. Such description must
be placed in a text file included with all distributions of the Covered
Software under this License. Except to the extent prohibited by statute
or regulation, such description must be sufficiently detailed for a
recipient of ordinary skill to be able to understand it.

5. Termination

---

5.1. The rights granted under this License will terminate automatically
if You fail to comply with any of its terms. However, if You become
compliant, then the rights granted under this License from a particular
Contributor are reinstated (a) provisionally, unless and until such
Contributor explicitly and finally terminates Your grants, and (b) on an
ongoing basis, if such Contributor fails to notify You of the
non-compliance by some reasonable means prior to 60 days after You have
come back into compliance. Moreover, Your grants from a particular
Contributor are reinstated on an ongoing basis if such Contributor
notifies You of the non-compliance by some reasonable means, this is the
first time You have received notice of non-compliance with this License
from such Contributor, and You become compliant prior to 30 days after
Your receipt of the notice.

5.2. If You initiate litigation against any entity by asserting a patent
infringement claim (excluding declaratory judgment actions,
counter-claims, and cross-claims) alleging that a Contributor Version
directly or indirectly infringes any patent, then the rights granted to
You by any and all Contributors for the Covered Software under Section
2.1 of this License shall terminate.

5.3. In the event of termination under Sections 5.1 or 5.2 above, all
end user license agreements (excluding distributors and resellers) which
have been validly granted by You or Your distributors under this License
prior to termination shall survive termination.

---

--
-  6. Disclaimer of Warranty *
-  ------------------------- *
--
-  Covered Software is provided under this License on an &quot;as is&quot; *
-  basis, without warranty of any kind, either expressed, implied, or *
-  statutory, including, without limitation, warranties that the *
-  Covered Software is free of defects, merchantable, fit for a *
-  particular purpose or non-infringing. The entire risk as to the *
-  quality and performance of the Covered Software is with You. *
-  Should any Covered Software prove defective in any respect, You *
-  (not any Contributor) assume the cost of any necessary servicing, *
-  repair, or correction. This disclaimer of warranty constitutes an *
-  essential part of this License. No use of any Covered Software is *
-  authorized under this License except under this disclaimer. *
--

---

---

--
-  7. Limitation of Liability *
-  -------------------------- *
--
-  Under no circumstances and under no legal theory, whether tort *
-  (including negligence), contract, or otherwise, shall any *
-  Contributor, or anyone who distributes Covered Software as *
-  permitted above, be liable to You for any direct, indirect, *
-  special, incidental, or consequential damages of any character *
-  including, without limitation, damages for lost profits, loss of *
-  goodwill, work stoppage, computer failure or malfunction, or any *
-  and all other commercial damages or losses, even if such party *
-  shall have been informed of the possibility of such damages. This *
-  limitation of liability shall not apply to liability for death or *
-  personal injury resulting from such party&#x27;s negligence to the *
-  extent applicable law prohibits such limitation. Some *
-  jurisdictions do not allow the exclusion or limitation of *
-  incidental or consequential damages, so this exclusion and *
-  limitation may not apply to You. *
--

---

8. Litigation

---

Any litigation relating to this License may be brought only in the
courts of a jurisdiction where the defendant maintains its principal
place of business and such litigation shall be governed by laws of that
jurisdiction, without reference to its conflict-of-law provisions.
Nothing in this Section shall prevent a party&#x27;s ability to bring
cross-claims or counter-claims.

9. Miscellaneous

---

This License represents the complete agreement concerning the subject
matter hereof. If any provision of this License is held to be
unenforceable, such provision shall be reformed only to the extent
necessary to make it enforceable. Any law or regulation which provides
that the language of a contract shall be construed against the drafter
shall not be used to construe this License against a Contributor.

10. Versions of the License

---

10.1. New Versions

Mozilla Foundation is the license steward. Except as provided in Section
10.3, no one other than the license steward has the right to modify or
publish new versions of this License. Each version will be given a
distinguishing version number.

10.2. Effect of New Versions

You may distribute the Covered Software under the terms of the version
of the License under which You originally received the Covered Software,
or under the terms of any subsequent version published by the license
steward.

10.3. Modified Versions

If you create software not governed by this License, and you want to
create a new license for such software, you may create and use a
modified version of this License if you rename the license and remove
any references to the name of the license steward (except to note that
such modified license differs from this License).

10.4. Distributing Source Code Form that is Incompatible With Secondary
Licenses

If You choose to distribute Source Code Form that is Incompatible With
Secondary Licenses under the terms of this version of the License, the
notice described in Exhibit B of this License must be attached.

## Exhibit A - Source Code Form License Notice

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.

If it is not possible or desirable to put the notice in a particular
file, then You may include the notice in a location (such as a LICENSE
file in a relevant directory) where a recipient would be likely to look
for such a notice.

You may add additional accurate notices of copyright ownership.

## Exhibit B - &quot;Incompatible With Secondary Licenses&quot; Notice

This Source Code Form is &quot;Incompatible With Secondary Licenses&quot;, as
defined by the Mozilla Public License, v. 2.0.
</pre>
</li>
<li class="license">
<h3 id="MPL-2.0">Mozilla Public License 2.0</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/soc/option-ext.git" target="_blank" rel="noopener">option-ext v0.2.0</a></li>
<li><a href="https://github.com/servo/stylo" target="_blank" rel="noopener">selectors v0.38.0</a></li>
</ul>
<pre class="license-text">Mozilla Public License Version 2.0
&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;&#x3D;

1. Definitions

---

1.1. &quot;Contributor&quot;
means each individual or legal entity that creates, contributes to
the creation of, or owns Covered Software.

1.2. &quot;Contributor Version&quot;
means the combination of the Contributions of others (if any) used
by a Contributor and that particular Contributor&#x27;s Contribution.

1.3. &quot;Contribution&quot;
means Covered Software of a particular Contributor.

1.4. &quot;Covered Software&quot;
means Source Code Form to which the initial Contributor has attached
the notice in Exhibit A, the Executable Form of such Source Code
Form, and Modifications of such Source Code Form, in each case
including portions thereof.

1.5. &quot;Incompatible With Secondary Licenses&quot;
means

    (a) that the initial Contributor has attached the notice described
        in Exhibit B to the Covered Software; or

    (b) that the Covered Software was made available under the terms of
        version 1.1 or earlier of the License, but not also under the
        terms of a Secondary License.

1.6. &quot;Executable Form&quot;
means any form of the work other than Source Code Form.

1.7. &quot;Larger Work&quot;
means a work that combines Covered Software with other material, in
a separate file or files, that is not Covered Software.

1.8. &quot;License&quot;
means this document.

1.9. &quot;Licensable&quot;
means having the right to grant, to the maximum extent possible,
whether at the time of the initial grant or subsequently, any and
all of the rights conveyed by this License.

1.10. &quot;Modifications&quot;
means any of the following:

    (a) any file in Source Code Form that results from an addition to,
        deletion from, or modification of the contents of Covered
        Software; or

    (b) any new file in Source Code Form that contains any Covered
        Software.

1.11. &quot;Patent Claims&quot; of a Contributor
means any patent claim(s), including without limitation, method,
process, and apparatus claims, in any patent Licensable by such
Contributor that would be infringed, but for the grant of the
License, by the making, using, selling, offering for sale, having
made, import, or transfer of either its Contributions or its
Contributor Version.

1.12. &quot;Secondary License&quot;
means either the GNU General Public License, Version 2.0, the GNU
Lesser General Public License, Version 2.1, the GNU Affero General
Public License, Version 3.0, or any later versions of those
licenses.

1.13. &quot;Source Code Form&quot;
means the form of the work preferred for making modifications.

1.14. &quot;You&quot; (or &quot;Your&quot;)
means an individual or a legal entity exercising rights under this
License. For legal entities, &quot;You&quot; includes any entity that
controls, is controlled by, or is under common control with You. For
purposes of this definition, &quot;control&quot; means (a) the power, direct
or indirect, to cause the direction or management of such entity,
whether by contract or otherwise, or (b) ownership of more than
fifty percent (50%) of the outstanding shares or beneficial
ownership of such entity.

2. License Grants and Conditions

---

2.1. Grants

Each Contributor hereby grants You a world-wide, royalty-free,
non-exclusive license:

(a) under intellectual property rights (other than patent or trademark)
Licensable by such Contributor to use, reproduce, make available,
modify, display, perform, distribute, and otherwise exploit its
Contributions, either on an unmodified basis, with Modifications, or
as part of a Larger Work; and

(b) under Patent Claims of such Contributor to make, use, sell, offer
for sale, have made, import, and otherwise transfer either its
Contributions or its Contributor Version.

2.2. Effective Date

The licenses granted in Section 2.1 with respect to any Contribution
become effective for each Contribution on the date the Contributor first
distributes such Contribution.

2.3. Limitations on Grant Scope

The licenses granted in this Section 2 are the only rights granted under
this License. No additional rights or licenses will be implied from the
distribution or licensing of Covered Software under this License.
Notwithstanding Section 2.1(b) above, no patent license is granted by a
Contributor:

(a) for any code that a Contributor has removed from Covered Software;
or

(b) for infringements caused by: (i) Your and any other third party&#x27;s
modifications of Covered Software, or (ii) the combination of its
Contributions with other software (except as part of its Contributor
Version); or

(c) under Patent Claims infringed by Covered Software in the absence of
its Contributions.

This License does not grant any rights in the trademarks, service marks,
or logos of any Contributor (except as may be necessary to comply with
the notice requirements in Section 3.4).

2.4. Subsequent Licenses

No Contributor makes additional grants as a result of Your choice to
distribute the Covered Software under a subsequent version of this
License (see Section 10.2) or under the terms of a Secondary License (if
permitted under the terms of Section 3.3).

2.5. Representation

Each Contributor represents that the Contributor believes its
Contributions are its original creation(s) or it has sufficient rights
to grant the rights to its Contributions conveyed by this License.

2.6. Fair Use

This License is not intended to limit any rights You have under
applicable copyright doctrines of fair use, fair dealing, or other
equivalents.

2.7. Conditions

Sections 3.1, 3.2, 3.3, and 3.4 are conditions of the licenses granted
in Section 2.1.

3. Responsibilities

---

3.1. Distribution of Source Form

All distribution of Covered Software in Source Code Form, including any
Modifications that You create or to which You contribute, must be under
the terms of this License. You must inform recipients that the Source
Code Form of the Covered Software is governed by the terms of this
License, and how they can obtain a copy of this License. You may not
attempt to alter or restrict the recipients&#x27; rights in the Source Code
Form.

3.2. Distribution of Executable Form

If You distribute Covered Software in Executable Form then:

(a) such Covered Software must also be made available in Source Code
Form, as described in Section 3.1, and You must inform recipients of
the Executable Form how they can obtain a copy of such Source Code
Form by reasonable means in a timely manner, at a charge no more
than the cost of distribution to the recipient; and

(b) You may distribute such Executable Form under the terms of this
License, or sublicense it under different terms, provided that the
license for the Executable Form does not attempt to limit or alter
the recipients&#x27; rights in the Source Code Form under this License.

3.3. Distribution of a Larger Work

You may create and distribute a Larger Work under terms of Your choice,
provided that You also comply with the requirements of this License for
the Covered Software. If the Larger Work is a combination of Covered
Software with a work governed by one or more Secondary Licenses, and the
Covered Software is not Incompatible With Secondary Licenses, this
License permits You to additionally distribute such Covered Software
under the terms of such Secondary License(s), so that the recipient of
the Larger Work may, at their option, further distribute the Covered
Software under the terms of either this License or such Secondary
License(s).

3.4. Notices

You may not remove or alter the substance of any license notices
(including copyright notices, patent notices, disclaimers of warranty,
or limitations of liability) contained within the Source Code Form of
the Covered Software, except that You may alter any license notices to
the extent required to remedy known factual inaccuracies.

3.5. Application of Additional Terms

You may choose to offer, and to charge a fee for, warranty, support,
indemnity or liability obligations to one or more recipients of Covered
Software. However, You may do so only on Your own behalf, and not on
behalf of any Contributor. You must make it absolutely clear that any
such warranty, support, indemnity, or liability obligation is offered by
You alone, and You hereby agree to indemnify every Contributor for any
liability incurred by such Contributor as a result of warranty, support,
indemnity or liability terms You offer. You may include additional
disclaimers of warranty and limitations of liability specific to any
jurisdiction.

4. Inability to Comply Due to Statute or Regulation

---

If it is impossible for You to comply with any of the terms of this
License with respect to some or all of the Covered Software due to
statute, judicial order, or regulation then You must: (a) comply with
the terms of this License to the maximum extent possible; and (b)
describe the limitations and the code they affect. Such description must
be placed in a text file included with all distributions of the Covered
Software under this License. Except to the extent prohibited by statute
or regulation, such description must be sufficiently detailed for a
recipient of ordinary skill to be able to understand it.

5. Termination

---

5.1. The rights granted under this License will terminate automatically
if You fail to comply with any of its terms. However, if You become
compliant, then the rights granted under this License from a particular
Contributor are reinstated (a) provisionally, unless and until such
Contributor explicitly and finally terminates Your grants, and (b) on an
ongoing basis, if such Contributor fails to notify You of the
non-compliance by some reasonable means prior to 60 days after You have
come back into compliance. Moreover, Your grants from a particular
Contributor are reinstated on an ongoing basis if such Contributor
notifies You of the non-compliance by some reasonable means, this is the
first time You have received notice of non-compliance with this License
from such Contributor, and You become compliant prior to 30 days after
Your receipt of the notice.

5.2. If You initiate litigation against any entity by asserting a patent
infringement claim (excluding declaratory judgment actions,
counter-claims, and cross-claims) alleging that a Contributor Version
directly or indirectly infringes any patent, then the rights granted to
You by any and all Contributors for the Covered Software under Section
2.1 of this License shall terminate.

5.3. In the event of termination under Sections 5.1 or 5.2 above, all
end user license agreements (excluding distributors and resellers) which
have been validly granted by You or Your distributors under this License
prior to termination shall survive termination.

---

--
-  6. Disclaimer of Warranty *
-  ------------------------- *
--
-  Covered Software is provided under this License on an &quot;as is&quot; *
-  basis, without warranty of any kind, either expressed, implied, or *
-  statutory, including, without limitation, warranties that the *
-  Covered Software is free of defects, merchantable, fit for a *
-  particular purpose or non-infringing. The entire risk as to the *
-  quality and performance of the Covered Software is with You. *
-  Should any Covered Software prove defective in any respect, You *
-  (not any Contributor) assume the cost of any necessary servicing, *
-  repair, or correction. This disclaimer of warranty constitutes an *
-  essential part of this License. No use of any Covered Software is *
-  authorized under this License except under this disclaimer. *
--

---

---

--
-  7. Limitation of Liability *
-  -------------------------- *
--
-  Under no circumstances and under no legal theory, whether tort *
-  (including negligence), contract, or otherwise, shall any *
-  Contributor, or anyone who distributes Covered Software as *
-  permitted above, be liable to You for any direct, indirect, *
-  special, incidental, or consequential damages of any character *
-  including, without limitation, damages for lost profits, loss of *
-  goodwill, work stoppage, computer failure or malfunction, or any *
-  and all other commercial damages or losses, even if such party *
-  shall have been informed of the possibility of such damages. This *
-  limitation of liability shall not apply to liability for death or *
-  personal injury resulting from such party&#x27;s negligence to the *
-  extent applicable law prohibits such limitation. Some *
-  jurisdictions do not allow the exclusion or limitation of *
-  incidental or consequential damages, so this exclusion and *
-  limitation may not apply to You. *
--

---

8. Litigation

---

Any litigation relating to this License may be brought only in the
courts of a jurisdiction where the defendant maintains its principal
place of business and such litigation shall be governed by laws of that
jurisdiction, without reference to its conflict-of-law provisions.
Nothing in this Section shall prevent a party&#x27;s ability to bring
cross-claims or counter-claims.

9. Miscellaneous

---

This License represents the complete agreement concerning the subject
matter hereof. If any provision of this License is held to be
unenforceable, such provision shall be reformed only to the extent
necessary to make it enforceable. Any law or regulation which provides
that the language of a contract shall be construed against the drafter
shall not be used to construe this License against a Contributor.

10. Versions of the License

---

10.1. New Versions

Mozilla Foundation is the license steward. Except as provided in Section
10.3, no one other than the license steward has the right to modify or
publish new versions of this License. Each version will be given a
distinguishing version number.

10.2. Effect of New Versions

You may distribute the Covered Software under the terms of the version
of the License under which You originally received the Covered Software,
or under the terms of any subsequent version published by the license
steward.

10.3. Modified Versions

If you create software not governed by this License, and you want to
create a new license for such software, you may create and use a
modified version of this License if you rename the license and remove
any references to the name of the license steward (except to note that
such modified license differs from this License).

10.4. Distributing Source Code Form that is Incompatible With Secondary
Licenses

If You choose to distribute Source Code Form that is Incompatible With
Secondary Licenses under the terms of this version of the License, the
notice described in Exhibit B of this License must be attached.

## Exhibit A - Source Code Form License Notice

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

If it is not possible or desirable to put the notice in a particular
file, then You may include the notice in a location (such as a LICENSE
file in a relevant directory) where a recipient would be likely to look
for such a notice.

You may add additional accurate notices of copyright ownership.

## Exhibit B - &quot;Incompatible With Secondary Licenses&quot; Notice

This Source Code Form is &quot;Incompatible With Secondary Licenses&quot;, as
defined by the Mozilla Public License, v. 2.0.
</pre>
</li>
<li class="license">
<h3 id="NCSA">University of Illinois/NCSA Open Source License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/rust-fuzz/libfuzzer" target="_blank" rel="noopener">libfuzzer-sys v0.4.13</a></li>
</ul>
<pre class="license-text">University of Illinois/NCSA Open Source License

Copyright (c) &lt;Year&gt; &lt;Owner Organization Name&gt;. All rights reserved.

Developed by: &lt;Name of Development Group&gt; &lt;Name of Institution&gt; &lt;URL for Development Group/Institution&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal with the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimers.

     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimers in the documentation and/or other materials provided with the distribution.

     * Neither the names of &lt;Name of Development Group, Name of Institution&gt;, nor the names of its contributors may be used to endorse or promote products derived from this Software without specific prior written permission.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE CONTRIBUTORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS WITH THE SOFTWARE.
</pre>
</li>
<li class="license">
<h3 id="Unicode-3.0">Unicode License v3</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/dtolnay/unicode-ident" target="_blank" rel="noopener">unicode-ident v1.0.27</a></li>
</ul>
<pre class="license-text">UNICODE LICENSE V3

COPYRIGHT AND PERMISSION NOTICE

Copyright © 1991-2023 Unicode, Inc.

NOTICE TO USER: Carefully read the following legal agreement. BY
DOWNLOADING, INSTALLING, COPYING OR OTHERWISE USING DATA FILES, AND/OR
SOFTWARE, YOU UNEQUIVOCALLY ACCEPT, AND AGREE TO BE BOUND BY, ALL OF THE
TERMS AND CONDITIONS OF THIS AGREEMENT. IF YOU DO NOT AGREE, DO NOT
DOWNLOAD, INSTALL, COPY, DISTRIBUTE OR USE THE DATA FILES OR SOFTWARE.

Permission is hereby granted, free of charge, to any person obtaining a
copy of data files and any associated documentation (the &quot;Data Files&quot;) or
software and any associated documentation (the &quot;Software&quot;) to deal in the
Data Files or Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, and/or sell
copies of the Data Files or Software, and to permit persons to whom the
Data Files or Software are furnished to do so, provided that either (a)
this copyright and permission notice appear with all copies of the Data
Files or Software, or (b) this copyright and permission notice appear in
associated Documentation.

THE DATA FILES AND SOFTWARE ARE PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF
THIRD PARTY RIGHTS.

IN NO EVENT SHALL THE COPYRIGHT HOLDER OR HOLDERS INCLUDED IN THIS NOTICE
BE LIABLE FOR ANY CLAIM, OR ANY SPECIAL INDIRECT OR CONSEQUENTIAL DAMAGES,
OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THE DATA
FILES OR SOFTWARE.

Except as contained in this notice, the name of a copyright holder shall
not be used in advertising or otherwise to promote the sale, use or other
dealings in these Data Files or Software without prior written
authorization of the copyright holder.
</pre>
</li>
<li class="license">
<h3 id="Unicode-3.0">Unicode License v3</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">icu_collections v2.4.0</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">icu_locale_core v2.4.0</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">icu_normalizer v2.4.0</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">icu_normalizer_data v2.4.0</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">icu_properties v2.4.0</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">icu_properties_data v2.4.0</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">icu_provider v2.4.0</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">litemap v0.8.3</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">potential_utf v0.1.6</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">tinystr v0.8.5</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">writeable v0.6.4</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">yoke-derive v0.8.4</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">yoke v0.8.4</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">zerofrom-derive v0.1.8</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">zerofrom v0.1.8</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">zerotrie v0.2.5</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">zerovec-derive v0.11.7</a></li>
<li><a href="https://github.com/unicode-org/icu4x" target="_blank" rel="noopener">zerovec v0.11.9</a></li>
</ul>
<pre class="license-text">UNICODE LICENSE V3

COPYRIGHT AND PERMISSION NOTICE

Copyright © 2020-2024 Unicode, Inc.

NOTICE TO USER: Carefully read the following legal agreement. BY
DOWNLOADING, INSTALLING, COPYING OR OTHERWISE USING DATA FILES, AND/OR
SOFTWARE, YOU UNEQUIVOCALLY ACCEPT, AND AGREE TO BE BOUND BY, ALL OF THE
TERMS AND CONDITIONS OF THIS AGREEMENT. IF YOU DO NOT AGREE, DO NOT
DOWNLOAD, INSTALL, COPY, DISTRIBUTE OR USE THE DATA FILES OR SOFTWARE.

Permission is hereby granted, free of charge, to any person obtaining a
copy of data files and any associated documentation (the &quot;Data Files&quot;) or
software and any associated documentation (the &quot;Software&quot;) to deal in the
Data Files or Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, and/or sell
copies of the Data Files or Software, and to permit persons to whom the
Data Files or Software are furnished to do so, provided that either (a)
this copyright and permission notice appear with all copies of the Data
Files or Software, or (b) this copyright and permission notice appear in
associated Documentation.

THE DATA FILES AND SOFTWARE ARE PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF
THIRD PARTY RIGHTS.

IN NO EVENT SHALL THE COPYRIGHT HOLDER OR HOLDERS INCLUDED IN THIS NOTICE
BE LIABLE FOR ANY CLAIM, OR ANY SPECIAL INDIRECT OR CONSEQUENTIAL DAMAGES,
OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THE DATA
FILES OR SOFTWARE.

Except as contained in this notice, the name of a copyright holder shall
not be used in advertising or otherwise to promote the sale, use or other
dealings in these Data Files or Software without prior written
authorization of the copyright holder.

SPDX-License-Identifier: Unicode-3.0

—

Portions of ICU4X may have been adapted from ICU4C and/or ICU4J.
ICU 1.8.1 to ICU 57.1 © 1995-2016 International Business Machines Corporation and others.
</pre>
</li>
<li class="license">
<h3 id="Zlib">zlib License</h3>
<p><strong>利用しているパッケージ (Used by):</strong></p>
<ul class="license-used-by">
<li><a href="https://github.com/trifectatechfoundation/zlib-rs" target="_blank" rel="noopener">zlib-rs v0.6.8</a></li>
</ul>
<pre class="license-text">(C) 2024 Trifecta Tech Foundation

This software is provided &#x27;as-is&#x27;, without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not
   claim that you wrote the original software. If you use this software
   in a product, an acknowledgment in the product documentation would be
   appreciated but is not required.

2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.

3. This notice may not be removed or altered from any source distribution.
   </pre>
   </li>
   <li class="license">
   <h3 id="Zlib">zlib License</h3>
   <p><strong>利用しているパッケージ (Used by):</strong></p>
   <ul class="license-used-by">
   <li><a href="https://github.com/orlp/foldhash" target="_blank" rel="noopener">foldhash v0.2.0</a></li>
   </ul>
   <pre class="license-text">Copyright (c) 2024 Orson Peters

This software is provided &#x27;as-is&#x27;, without any express or implied warranty. In
no event will the authors be held liable for any damages arising from the use of
this software.

Permission is granted to anyone to use this software for any purpose, including
commercial applications, and to alter it and redistribute it freely, subject to
the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim
   that you wrote the original software. If you use this software in a product,
   an acknowledgment in the product documentation would be appreciated but is
   not required.

2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.

3. This notice may not be removed or altered from any source distribution.</pre>
   </li>
   </ul>
    </main>
</body>
</html>
