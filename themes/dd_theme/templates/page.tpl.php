<header id="navbar" role="banner" class="navbar navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container">
      <!-- .btn-navbar is used as the toggle for collapsed navbar content -->
      <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </a>

      <?php if (!empty($logo)): ?>
        <a class="logo pull-left" href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>">
          <img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>"/>
        </a>
      <?php endif; ?>

      <?php if (!empty($site_name)): ?>
        <h1 id="site-name">
          <a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" class="brand"><?php print $site_name; ?></a>
        </h1>
      <?php endif; ?>

      <?php if (!empty($primary_nav) || !empty($secondary_nav) || !empty($page['navigation'])): ?>
        <div class="nav-collapse collapse">

          <nav role="navigation">

            <div data-loading></div>

            <ul class="menu nav pull-right">
              <li class="first leaf">
                <a href="/">My projects</a>
              </li>
              <li class="">
                <a href="/settings">My account</a>
              </li>
              <li class="last leaf">
                <a href="/logout">Log out</a>
              </li>
            </ul>
          </nav>

        </div>
      <?php endif; ?>
    </div>
  </div>
</header>

<div class="main-container container">

  <header role="banner" id="page-header">
    <?php if (!empty($site_slogan)): ?>
      <p class="lead"><?php print $site_slogan; ?></p>
    <?php endif; ?>

    <?php print render($page['header']); ?>
  </header> <!-- /#header -->

  <div class="row">

    <?php if (!empty($page['sidebar_first'])): ?>
      <aside class="span3" role="complementary">
        <?php print render($page['sidebar_first']); ?>
      </aside>  <!-- /#sidebar-first -->
    <?php endif; ?>  

    <section class="<?php print _bootstrap_content_span($columns); ?>">  
      <?php if (!empty($page['highlighted'])): ?>
        <div class="highlighted hero-unit"><?php print render($page['highlighted']); ?></div>
      <?php endif; ?>
      
      <a id="main-content"></a>
      <?php print render($title_prefix); ?>
<!--       <?php if (!empty($title)): ?>
        <h1 class="page-header"><?php print $title; ?></h1>
      <?php endif; ?> -->
      <?php print render($title_suffix); ?>
      <?php print $messages; ?>
      <?php if (!empty($tabs)): ?>
        <?php print render($tabs); ?>
      <?php endif; ?>
      <?php if (!empty($page['help'])): ?>
        <div class="well"><?php print render($page['help']); ?></div>
      <?php endif; ?>
      <?php if (!empty($action_links)): ?>
        <ul class="action-links"><?php print render($action_links); ?></ul>
      <?php endif; ?>

      <?php print render($page['content']); ?>
    </section>

    <?php if (!empty($page['sidebar_second'])): ?>
      <aside class="span3" role="complementary">
        <?php print render($page['sidebar_second']); ?>
      </aside>  <!-- /#sidebar-second -->
    <?php endif; ?>

  </div>
  <footer class="footer container">
    <?php print render($page['footer']); ?>
  </footer>

  <!-- UserVoice JavaScript SDK (only needed once on a page) -->
  <script>(function(){var uv=document.createElement('script');uv.type='text/javascript';uv.async=true;uv.src='//widget.uservoice.com/EsCN2r7T4ETUQ2cSm76fg.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(uv,s)})()</script>

  <!-- A tab to launch the Classic Widget -->
  <script>
  UserVoice = window.UserVoice || [];
  UserVoice.push(['showTab', 'classic_widget', {
    mode: 'full',
    primary_color: '#cc6d00',
    link_color: '#007dbf',
    default_mode: 'support',
    forum_id: 209503,
    tab_label: 'Contact us',
    tab_color: '#cc6d00',
    tab_position: 'middle-right',
    tab_inverted: false
  }]);
  </script>

</div>
