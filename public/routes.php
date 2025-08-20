<?php

use Slim\Http\Request;
use Slim\Http\Response;

## random viewer
// $noran1 = array(1,3);
// $noran2 = array(2,4);
$noran1 = array(5, 7);
$noran2 = array(6, 8);
$ranum1 = $noran1[array_rand($noran1)];
$ranum2 = $noran2[array_rand($noran2)];
$is_view = $ranum1 . $ranum2;
// $is_view = 7;

## if insert mysql
$is_execute = 1;

// Routes

$app->get('/[{name}]', function (Request $request, Response $response, array $args) {
  // Sample log message
  $this->logger->info("Slim-Skeleton '/' route");

  // Render index view
  return $this->renderer->render($response, 'index.phtml', $args);
});

## all news
$app->get("/all_news/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $news_type = $params['news_type']; ## all, cat, ...
  $offset = $params['offset'];
  $limit = $params['limit'];
  $news_id = $params['news_id'];
  $cat_id = $params['cat_id'];
  $editor_id = $params['editor_id'];
  $title = $params['title'];
  $in_years = $params['in_years'];
  $in_month = $params['in_month'];
  $in_date = $params['in_date'];
  $date_query = $params['date_query'];

  $indeks_date = $in_years . '-' . $in_month . '-' . $in_date . '%';

  if ($news_type == 'all') {
    $addwhere = "a.catnews_id NOT IN (30) AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'cat') {
    if ($cat_id == 1) {
      $addwhere = "a.catnews_id IN ('1', '23', '24', '25') AND";
      $addorder = "a.news_datepub DESC";
    } else {
      $addwhere = "a.catnews_id=" . $cat_id . " AND";
      $addorder = "a.news_datepub DESC";
    }
  } else if ($news_type == 'headline') {
    if (empty($cat_id)) {
      $addwhere = "a.news_headline=1 AND";
      $addorder = "a.news_datepub DESC";
    } else {
      if ($cat_id == 1) {
        $addwhere = "a.news_headline=1 AND a.catnews_id IN ('1', '23', '24', '25') AND";
        $addorder = "a.news_datepub DESC";
      } elseif ($cat_id == 99999) { ## headline for ramadhan
        $addwhere = "a.news_headline=1 AND a.focnews_id IN (223,224,225) AND";
        $addorder = "a.news_datepub DESC";
      } else {
        $addwhere = "a.news_headline=1 AND a.catnews_id=" . $cat_id . " AND";
        $addorder = "a.news_datepub DESC";
      }
    }
  } else if ($news_type == 'headline_rand') {
    // $addwhere = "a.news_headline=1 AND a.news_datepub >= DATE(NOW()) AND";
    $addwhere = "a.news_headline=1 AND a.news_datepub >= DATE_SUB(NOW(), INTERVAL 6 HOUR) AND";
    $addorder = "RAND()";
  } else if ($news_type == 'search') {
    $keys = explode(" ", $title);

    $addwhere .= "a.news_title LIKE '%" . $title . "%' AND";
    // $addwhere .= "a.news_title LIKE '%".$title."%' OR";
    // foreach($keys as $k) {
    //   $addwhere .= " a.news_title LIKE '%$k%' AND";
    // }
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'populer') {
    // $addwhere = "a.news_datepub >= DATE(NOW()) - INTERVAL 2 DAY AND";
    $addwhere = "a.news_datepub >= DATE(NOW()) AND";
    $addorder = "f.pageviews DESC";
  } else if ($news_type == 'trending') {
    $addwhere = "a.news_headline=1 AND a.news_datepub >= DATE(NOW()) - INTERVAL 2 DAY AND";
    $addorder = "f.pageviews DESC";
  } else if ($news_type == 'tag') {
    $addwhere = "a.news_tags LIKE '%" . $title . "%' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'focus') {
    $addwhere = "a.focnews_id=" . $cat_id . " AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'othernews') {
    $addwhere = "a.news_id NOT IN (" . $news_id . ") AND a.catnews_id=" . $cat_id . " AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'related') {
    $addwhere = "a.news_related LIKE '%$title%' AND a.news_id NOT IN ('$news_id') AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'related_new') {
    // $addwhere = "a.news_tags LIKE '%$title%' AND a.news_id NOT IN ('$news_id') AND";
    // $addwhere = "a.news_id NOT IN ('$news_id') AND find_in_set('$title',a.news_tags) <> 0 AND";
    $addwhere = "a.news_id != $news_id AND a.news_title LIKE '%" . $title . "%' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'indeks') {
    $addwhere = "a.news_datepub LIKE '" . $indeks_date . "' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'indeks_new') {
    $addwhere = "a.news_datepub LIKE '" . $date_query . "%' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'writer') {
    $addwhere = "a.news_writer LIKE '%" . $title . "%' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'editor') {
    $addwhere = "a.editor_id='" . $editor_id . "' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'ramadhan') {
    $addwhere = "a.focnews_id IN (223,224,225) AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'w_ki') {
    $addwhere = "a.catnews_id NOT IN (30) AND";
    $addorder = "a.news_datepub DESC";
  }

  $sql = "SELECT
            a.news_id,
            a.catnews_id,
            a.news_datepub,
            a.news_headline,
            a.news_title,
            a.news_subtitle,
            a.news_caption,
            a.news_image_new,
            a.news_description,
            a.news_content,
            a.news_ytube_id,
            a.news_tags,
            a.news_view,
            f.pageviews,
            -- CONCAT('/read/',a.news_id,'/',date_format(a.news_datepub, '%Y%m%d'),'/',date_format(a.news_datepub, '%H%i%s'),'/',LOWER(REPLACE(REGEXP_REPLACE(a.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as urlPath,
            CONCAT('/read/news/',a.news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci,
            CONCAT('/',b.catnews_slug,'/',a.news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci4,
            a.news_city,
            a.modified,
            b.catnews_title AS cat_title,
            b.catnews_slug AS cat_slug,
            a.news_writer,
            c.editor_name,
            d.source_site_name,
            d.source_site_url,
            CONCAT_WS(' ', e.user_first_name, e.user_las_name) AS publisher_name
            -- COUNT(*) AS totalRows
          FROM
            news a
            LEFT JOIN news_category b ON (a.catnews_id=b.catnews_id)
            LEFT JOIN editor c ON (a.editor_id=c.editor_id)
            LEFT JOIN source d ON (d.source_site_id=a.source_site_id)
            LEFT JOIN crud_users e ON (e.id=a.created_by)
            LEFT JOIN news_views f ON (f.news_id=a.news_id)
          WHERE
            $addwhere
            a.news_datepub >= '2015-01-01 00:00:00' AND
            a.news_datepub <= NOW() AND
            a.news_status = 1
          ORDER BY
            $addorder
          LIMIT $offset, $limit";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();

  // $result = $this->cache->withExpires($response, time() + 180)->withJson(["status" => "success", "data" => $result], 200);
  // return $result;

  // $newResponse = $this->cache->withExpires($response->withJson(["status" => "success", "data" => $result], 200), time() + 7200);
  // return $newResponse;
  return $response
    ->withHeader('Access-Control-Allow-Origin', '*')
    ->withJson(["status" => "success", "data" => $result], 200);
});

## all news for index
$app->get("/all_news_index/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $news_type = $params['news_type']; ## all, cat, ...
  $offset = $params['offset'];
  $limit = $params['limit'];
  $news_id = $params['news_id'];
  $cat_id = $params['cat_id'];
  $editor_id = $params['editor_id'];
  $title = $params['title'];
  $in_years = $params['in_years'];
  $in_month = $params['in_month'];
  $in_date = $params['in_date'];
  $date_query = $params['date_query'];

  $indeks_date = $in_years . '-' . $in_month . '-' . $in_date . '%';

  if ($news_type == 'all') {
    $addwhere = "";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'cat') {
    if ($cat_id == 1) {
      $addwhere = "a.catnews_id IN ('1', '23', '24', '25') AND";
      $addorder = "a.news_datepub DESC";
    } else {
      $addwhere = "a.catnews_id=" . $cat_id . " AND";
      $addorder = "a.news_datepub DESC";
    }
  } else if ($news_type == 'headline') {
    if (empty($cat_id)) {
      $addwhere = "a.news_headline=1 AND";
      $addorder = "a.news_datepub DESC";
    } else {
      if ($cat_id == 1) {
        $addwhere = "a.news_headline=1 AND a.catnews_id IN ('1', '23', '24', '25') AND";
        $addorder = "a.news_datepub DESC";
      } elseif ($cat_id == 99999) { ## headline for ramadhan
        $addwhere = "a.news_headline=1 AND a.focnews_id IN (223,224,225) AND";
        $addorder = "a.news_datepub DESC";
      } else {
        $addwhere = "a.news_headline=1 AND a.catnews_id=" . $cat_id . " AND";
        $addorder = "a.news_datepub DESC";
      }
    }
  } else if ($news_type == 'headline_rand') {
    // $addwhere = "a.news_headline=1 AND a.news_datepub >= DATE(NOW()) AND";
    $addwhere = "a.news_headline=1 AND a.news_datepub >= DATE_SUB(NOW(), INTERVAL 6 HOUR) AND";
    $addorder = "RAND()";
  } else if ($news_type == 'search') {
    $keys = explode(" ", $title);

    $addwhere .= "a.news_title LIKE '%" . $title . "%' AND";
    // $addwhere .= "a.news_title LIKE '%".$title."%' OR";
    // foreach($keys as $k) {
    //   $addwhere .= " a.news_title LIKE '%$k%' AND";
    // }
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'populer') {
    // $addwhere = "a.news_datepub >= DATE(NOW()) - INTERVAL 1 DAY AND";
    $addwhere = "a.news_datepub >= DATE(NOW()) AND";
    $addorder = "a.news_view DESC";
  } else if ($news_type == 'trending') {
    $addwhere = "a.news_headline=1 AND a.news_datepub >= DATE(NOW()) - INTERVAL 3 DAY AND";
    $addorder = "a.news_view DESC";
  } else if ($news_type == 'tag') {
    $addwhere = "a.news_tags LIKE '%" . $title . "%' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'focus') {
    $addwhere = "a.focnews_id=" . $cat_id . " AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'othernews') {
    $addwhere = "a.news_id NOT IN (" . $news_id . ") AND a.catnews_id=" . $cat_id . " AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'related') {
    $addwhere = "a.news_related LIKE '%$title%' AND a.news_id NOT IN ('$news_id') AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'related_new') {
    // $addwhere = "a.news_tags LIKE '%$title%' AND a.news_id NOT IN ('$news_id') AND";
    $addwhere = "a.news_id NOT IN ('$news_id') AND find_in_set('$title',a.news_tags) <> 0 AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'indeks') {
    $addwhere = "a.news_datepub LIKE '" . $indeks_date . "' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'indeks_new') {
    $addwhere = "a.news_datepub LIKE '" . $date_query . "%' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'writer') {
    $addwhere = "a.news_writer LIKE '%" . $title . "%' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'editor') {
    $addwhere = "a.editor_id='" . $editor_id . "' AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'ramadhan') {
    $addwhere = "a.focnews_id IN (223,224,225) AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'w_ki') {
    $addwhere = "a.catnews_id NOT IN (30) AND";
    $addorder = "a.news_datepub DESC";
  } else if ($news_type == 'google') {
    $addwhere = "a.catnews_id NOT IN (30) AND a.news_datepub <= NOW() AND";
    $addorder = "a.news_datepub DESC";
  }

  $sql = "SELECT
            a.news_id,
            a.catnews_id,
            a.news_datepub,
            a.news_headline,
            a.news_title,
            a.news_subtitle,
            a.news_caption,
            a.news_image_new,
            a.news_description,
            a.news_content,
            a.news_ytube_id,
            a.news_tags,
            a.news_view,
            CONCAT('/read/',a.news_id,'/',date_format(a.news_datepub, '%Y%m%d'),'/',date_format(a.news_datepub, '%H%i%s'),'/',LOWER(REPLACE(REGEXP_REPLACE(a.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as urlPath,
            CONCAT('/read/news/',a.news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci,
            CONCAT('/',b.catnews_slug,'/',a.news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci4,
            a.news_city,
            a.modified,
            b.catnews_title AS cat_title,
            b.catnews_slug AS cat_slug,
            a.news_writer,
            c.editor_name,
            d.source_site_name,
            d.source_site_url,
            CONCAT_WS(' ', e.user_first_name, e.user_las_name) AS publisher_name
            -- COUNT(*) AS totalRows
          FROM
            news a
            LEFT JOIN news_category b ON a.catnews_id=b.catnews_id
            LEFT JOIN editor c ON a.editor_id=c.editor_id
            LEFT JOIN source d ON d.source_site_id=a.source_site_id
            LEFT JOIN crud_users e ON e.id=a.created_by
          WHERE
            $addwhere
            a.news_datepub >= '2015-01-01 00:00:00' AND
            a.news_status = 1
          ORDER BY
            $addorder
          LIMIT $offset, $limit";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## news detail
$app->get("/news_detail/{id}", function (Request $request, Response $response, $args) {
  global $is_view;

  $id = $args["id"];
  $sql = "SELECT
            a.news_id,
            a.is_code,
            a.news_datepub,
            a.news_title,
            a.news_subtitle,
            a.news_caption,
            a.news_image_new,
            a.news_description,
            -- TO_BASE64(a.news_content) AS news_content,
            a.news_content AS news_content,
            a.news_tags,
            a.focnews_id,
            a.news_view,
            a.news_writer,
            g.slug AS writer_slug,
            g.type AS writer_type,
            a.news_city,
            a.news_related,
            a.news_chapter,
            a.news_ytube_id,
            a.catnews_id,
            b.catnews_slug,
            b.catnews_title,
            c.editor_name,
            c.editor_alias,
            d.focnews_title,
            e.source_site_name,
            e.source_site_url,
            CONCAT_WS(' ', f.user_first_name, f.user_las_name) AS publisher_name,
            a.is_hoaks,
            a.is_code,
            a.modified,
            -- CONCAT('/read/',a.news_id,'/',date_format(a.news_datepub, '%Y%m%d'),'/',date_format(a.news_datepub, '%H%i%s'),'/',LOWER(REPLACE(REGEXP_REPLACE(a.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-')),'/') as urlPath,
            CONCAT('/read/news/',a.news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci,
            CONCAT('/',b.catnews_slug,'/',a.news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci4
          FROM news a
          LEFT JOIN news_category b ON a.catnews_id = b.catnews_id
          LEFT JOIN editor c ON a.editor_id = c.editor_id
          LEFT JOIN news_focus d ON a.focnews_id = d.focnews_id
          LEFT JOIN source e ON a.source_site_id = e.source_site_id
          LEFT JOIN crud_users f ON a.created_by = f.id
          LEFT JOIN journalist g ON a.news_writer = g.name
          WHERE a.news_id=:id AND a.news_status = 1";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":id" => $id]);
  $result = $stmt->fetch();

  if (!empty($result["news_id"])) {

    ## update viewer
    // $sql = "UPDATE news SET news_view=news_view+$is_view WHERE news_id=:id";
    // $stmt = $this->db->prepare($sql);
    // $stmt->execute([":id" => $id]);

    // return $response->withJson(["status" => "success", "data" => $result], 200);
    // new
    $newResponse = $response->withHeader('Cache-Control', 'public, max-stale=604800')->withJson(["status" => "success", "data" => $result], 200);
    return $newResponse;
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
  // return $response->withJson(["status" => "success", "data" => $result], 200);
});

## news detail
$app->get("/news_detail/uniq/{id}", function (Request $request, Response $response, $args) {
  global $is_view;

  $id = $args["id"];
  $sql = "SELECT
            a.news_id AS id,
            a.is_code AS uniq_id,
            a.news_title AS title,
            a.news_description AS description,
            a.news_tags AS keyword,
            a.news_image_new AS image,
            CONCAT('/read/news/',news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci,
            CONCAT('/',b.catnews_slug,'/',a.news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci4
          FROM news a
          LEFT JOIN news_category b ON a.catnews_id = b.catnews_id
          WHERE a.is_code=:id AND a.news_status = 1";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":id" => $id]);
  $result = $stmt->fetch();

  if (!empty($result["id"])) {
    return $response->withJson(["status" => "success", "data" => $result], 200);
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
  // return $response->withJson(["status" => "success", "data" => $result], 200);
});

## list news related
$app->get("/news_related/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $related = $params['related'];
  $news_id = $params['news_id'];
  $cat_id = $params['cat_id'];
  $rel_title = $params['rel_title'];

  if ($related == 'yes') {
    $sql = "SELECT
            news_id,
            news_datepub,
            news_title,
            news_subtitle,
            news_image_new
            FROM
            news
            WHERE
            news_related LIKE '%$rel_title%' AND
            news_id NOT IN ('$news_id') AND
            news_datepub >= '2015-01-01 00:00:00' AND
            news_datepub <= NOW() AND
            news_status = '1'
            ORDER BY
            news_datepub DESC
            LIMIT 0, 4";
  } else {
    $sql = "SELECT
            news_id,
            news_datepub,
            news_title,
            news_subtitle,
            news_image_new
            FROM
            news
            WHERE
            news_id NOT IN ('$news_id') AND
            catnews_id = '$cat_id' AND
            news_datepub >= '2015-01-01 00:00:00' AND
            news_datepub <= NOW() AND
            news_status = '1'
            ORDER BY
            news_datepub DESC
            LIMIT 0, 4";
  }

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## category detail
$app->get("/cat_detail/{slug}", function (Request $request, Response $response, $args) {
  $slug = $args["slug"];
  $sql = "SELECT * FROM news_category WHERE catnews_slug=:slug";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":slug" => $slug]);
  $result = $stmt->fetch();

  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## focus detail
$app->get("/focus_detail/{id}", function (Request $request, Response $response, $args) {
  $id = $args["id"];
  $sql = "SELECT
            *,
            CONCAT('/fokus/',focnews_id,'/',LOWER(REPLACE(REGEXP_REPLACE(focnews_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as urlPath
          FROM news_focus WHERE focnews_id=:id";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":id" => $id]);
  $result = $stmt->fetch();

  return $response
    ->withHeader('Access-Control-Allow-Origin', '*')
    ->withJson(["status" => "success", "data" => $result], 200);
});

## total pages
$app->get("/total_pages/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $type = $params['type'];
  $id = $params['id'];
  $slug = $params['slug'];

  if ($type == 'all') {
    $addwhere = "";
  } elseif ($type == 'cat') {
    $addwhere .= "catnews_id='$id' AND ";
    $addwhere .= "news_datepub >= '2015-01-01 00:00:00' AND ";
  } elseif ($type == 'tag') {
    $addwhere .= "news_tags LIKE '%$slug%' AND ";
    $addwhere .= "news_datepub >= '2015-01-01 00:00:00' AND ";
  } elseif ($type == 'search') {
    $keys = explode(" ", $slug);

    $addwhere .= "news_title LIKE '%" . $slug . "%' OR";
    foreach ($keys as $k) {
      $addwhere .= " news_title LIKE '%$k%' AND ";;
    }
    $addwhere .= "news_datepub >= '2015-01-01 00:00:00' AND ";
  } elseif ($type == 'focus_detail') {
    $addwhere .= "focnews_id='$id' AND ";
    $addwhere .= "news_datepub >= '2015-01-01 00:00:00' AND ";
  } elseif ($type == 'headline') {
    $addwhere .= "news_headline=1 AND ";
    $addwhere .= "DATE(news_datepub) = CURDATE() AND ";
  } elseif ($type == 'populer') {
    $addwhere .= "news_datepub >= DATE(NOW()) AND ";
    $addwhere .= "news_datepub >= '2015-01-01 00:00:00' AND ";
  } elseif ($type == 'writer') {
    $addwhere .= "news_writer LIKE '%$slug%' AND ";
    $addwhere .= "news_datepub >= '2015-01-01 00:00:00' AND ";
  } elseif ($type == 'editor') {
    $addwhere .= "editor_id='$id' AND ";
    $addwhere .= "news_datepub >= '2015-01-01 00:00:00' AND ";
  } elseif ($type == 'fotografer') {
    $addwhere .= "gal_pewarta LIKE '%$slug%' AND ";
    $addwhere .= "gal_datepub >= '2015-01-01 00:00:00' AND ";
  } elseif ($type == 'ramadhan') {
    $addwhere .= "focnews_id IN (223,224,225) AND ";
    $addwhere .= "news_datepub >= '2015-01-01 00:00:00' AND ";
  } else {
    $addwhere = "";
  }

  if ($type == 'focus') {
    $sql = "SELECT
            COUNT(*) AS totalPages
            FROM
            news_focus
            WHERE
            status='1'";
  } else if ($type == 'foto_list') {
    $sql = "SELECT
            COUNT(*) AS totalPages
            FROM
            gallery
            WHERE
            gal_datepub <= NOW() AND
            gal_status='1'";
  } else if ($type == 'fotografer') {
    $sql = "SELECT
            COUNT(*) AS totalPages
            FROM
            gallery
            WHERE
            $addwhere
            gal_datepub <= NOW() AND
            gal_status='1'";
  } else if ($type == 'ekoran') {
    $sql = "SELECT
            COUNT(*) AS totalPages
            FROM
            ekoran
            WHERE
            datepub <= NOW() AND
            status='1'";
  } else {
    $sql = "SELECT
            COUNT(*) AS totalPages
            FROM
            news
            WHERE
            $addwhere
            news_datepub <= NOW() AND
            news_status='1'";
  }

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetch();

  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## news maps detail
$app->get("/newsmaps/{id}", function (Request $request, Response $response, $args) {
  $id = $args["id"];
  $sql = "SELECT id, news_id, url_map, TO_BASE64(iframe_map) AS iframe_map, badge FROM news_map WHERE news_id=:id";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":id" => $id]);
  $result = $stmt->fetch();

  if (!empty($result["news_id"])) {
    return $response->withJson(["status" => "success", "data" => $result], 200);
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
});

## list news maps
$app->get("/list_newsmaps/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $offset = $params['offset'];
  $limit = $params['limit'];

  $sql = "SELECT
            b.news_id,
            b.news_datepub,
            b.news_title,
            b.news_subtitle,
            b.news_image_new,
            a.url_map,
            TO_BASE64(a.iframe_map) AS iframe_map,
            CONCAT('/read/news/',b.news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(b.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci
          FROM
            news_map a
            LEFT JOIN news b ON b.news_id=a.news_id
          WHERE
            b.news_datepub >= '2015-01-01 00:00:00' AND
            b.news_datepub <= NOW() AND
            b.news_status = '1'
          ORDER BY
            b.news_datepub DESC
          LIMIT $offset, $limit";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## list fokus
$app->get("/news/iguides/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $id = $params['id'];
  $offset = $params['offset'];
  $limit = $params['limit'];

  $sql = "SELECT
            a.ign_place_id,
            a.ign_news_id,
            b.news_title,
            b.news_image_new,
            CONCAT('/read/',b.news_id,'/',date_format(b.news_datepub, '%Y%m%d'),'/',date_format(b.news_datepub, '%H%i%s'),'/',LOWER(REPLACE(REGEXP_REPLACE(b.news_title,'[^a-zA-Z0-9 ]',''), ' ', '-')),'/') as urlPath,
            CONCAT('/read/news/',news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci
          FROM ig_news a
          LEFT JOIN news b ON b.news_id=a.ign_news_id
          WHERE a.ign_place_id='$id' AND b.news_status=1 ORDER BY b.news_datepub DESC LIMIT $offset, $limit";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  $rows = $stmt->rowCount();

  if ($rows > 0) {
    return $response->withJson(["status" => TRUE, "data" => $result, "total" => $rows], 200);
  } else {
    return $response->withJson(["status" => FALSE, "data" => $result, "total" => $rows], 200);
  }
});

## list fokus
$app->get("/list_focus/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $offset = $params['offset'];
  $limit = $params['limit'];

  $sql = "SELECT
            focnews_id,
            focnews_title,
            focnews_keyword,
            created,
            CONCAT('/fokus/',focnews_id,'/',LOWER(REPLACE(REGEXP_REPLACE(focnews_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as urlPath
          FROM news_focus WHERE status=1 AND focnews_id NOT IN (270) ORDER BY created DESC LIMIT $offset, $limit";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## list fokus
$app->get("/list_focus_box/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $offset = $params['offset'];
  $limit = $params['limit'];
  $is_year = date('Y');

  // $sql = "SELECT
  //           focnews_id,
  //           focnews_title,
  //           CONCAT('/fokus/',focnews_id,'/',LOWER(REPLACE(REGEXP_REPLACE(focnews_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as urlPath
  //         FROM news_focus WHERE YEAR(created)<=$is_year AND status=1 AND focnews_id NOT IN (270) ORDER BY focnews_id DESC LIMIT $offset, $limit";
  $sql = "SELECT
            focnews_id,
            focnews_title,
            CONCAT('/fokus/',focnews_id,'/',LOWER(REPLACE(REGEXP_REPLACE(focnews_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as urlPath
          FROM news_focus WHERE status=1 AND focnews_id NOT IN (270) ORDER BY focnews_id DESC LIMIT $offset, $limit";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## all gallery
$app->get("/all_gallery/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $news_type = $params['news_type']; ## all, cat, ...
  $offset = $params['offset'];
  $limit = $params['limit'];
  $news_id = $params['news_id'];
  $cat_id = $params['cat_id'];
  $title = $params['title'];
  $in_years = $params['in_years'];
  $in_month = $params['in_month'];
  $in_date = $params['in_date'];

  $indeks_date = $in_years . '-' . $in_month . '-' . $in_date . '%';

  if ($news_type == 'all') {
    $addwhere = "";
    $addorder = "a.gal_datepub DESC";
  } else if ($news_type == 'cat') {
    if (empty($cat_id)) {
      $addwhere = "";
      $addorder = "a.gal_datepub DESC";
    } else {
      $addwhere = "a.gal_catid=" . $cat_id . " AND ";
      $addorder = "a.gal_datepub DESC";
    }
  } else if ($news_type == 'headline') {
    $addwhere = "a.gal_headline=1 AND ";
    $addorder = "a.gal_datepub DESC";
  } else if ($news_type == 'search') {
    $addwhere = "a.gal_title LIKE '%" . $title . "%' AND ";
    $addorder = "a.gal_datepub DESC";
  } else if ($news_type == 'fotografer') {
    $addwhere = "a.gal_pewarta LIKE '%" . $title . "%' AND ";
    $addorder = "a.gal_datepub DESC";
  } else if ($news_type == 'othernews') {
    $addwhere = "a.gal_id NOT IN (" . $news_id . ") AND a.gal_catid=" . $cat_id . " AND ";
    $addorder = "a.gal_datepub DESC";
  }

  $value = "";
  $sql = "SELECT
            a.gal_id,
            a.gal_title,
            a.gal_subtitle,
            a.gal_datepub,
            a.gal_description,
            a.gal_view,
            b.gi_image AS gal_cover,
            c.title AS galcat_title,
            c.slug AS galcat_slug,
            CONCAT('/read/foto/',a.gal_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.gal_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as urlPath,
            CONCAT('/foto/',a.gal_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.gal_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci4
          FROM gallery a
          LEFT JOIN gallery_img b ON a.gal_id = b.gal_id
          LEFT JOIN gallery_cat c ON a.gal_catid = c.id
          WHERE
            $addwhere
            a.gal_datepub >= '2015-01-01 00:00:00' AND
            a.gal_datepub <= NOW() AND
            a.gal_status = 1 AND
            b.gi_cover = 1
          ORDER BY
            $addorder
          LIMIT $offset, $limit";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response
    ->withHeader('Access-Control-Allow-Origin', '*')
    ->withJson(["status" => "success", "data" => $result], 200);
});

## foto detail
$app->get("/foto_detail/{id}", function (Request $request, Response $response, $args) {
  global $is_view;

  $id = $args["id"];
  $sql = "SELECT
            a.gal_id,
            a.gal_catid,
            a.gal_subtitle,
            a.gal_title,
            a.gal_description,
            a.gal_datepub,
            -- TO_BASE64(a.gal_content) AS gal_content,
            a.gal_content,
            a.gal_city,
            a.gal_pewarta,
            f.slug AS writer_slug,
            f.type AS writer_type,
            a.gal_view,
            b.gi_image AS gal_cover,
            c.editor_name,
            c.editor_alias,
            CONCAT_WS(' ', d.user_first_name, d.user_las_name) AS publisher_name,
            e.title AS galcat_title,
            e.slug AS galcat_slug,
            CONCAT('/read/foto/',a.gal_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.gal_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as urlPath,
            CONCAT('/foto/',a.gal_id,'/',LOWER(REPLACE(REGEXP_REPLACE(a.gal_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci4
          FROM gallery a
            LEFT JOIN gallery_img b ON a.gal_id = b.gal_id
            LEFT JOIN editor c ON a.editor_id = c.editor_id
            LEFT JOIN crud_users d ON a.created_by = d.id
            LEFT JOIN gallery_cat e ON a.gal_catid = e.id
            LEFT JOIN journalist f ON a.gal_pewarta = f.name
          WHERE
            a.gal_id=:id AND
            a.gal_status='1' AND
            b.gi_cover='1'";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":id" => $id]);
  $result = $stmt->fetch();

  if (!empty($result["gal_id"])) {

    ## update viewer
    $sql = "UPDATE gallery SET gal_view=gal_view+$is_view WHERE gal_id=:id";
    $stmt = $this->db->prepare($sql);
    $stmt->execute([":id" => $id]);

    return $response->withJson(["status" => "success", "data" => $result], 200);
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
  // return $response->withJson(["status" => "success", "data" => $result], 200);
});

## foto slide in detail foto
$app->get("/foto_slide/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $gal_id = $params['gal_id'];

  $sql = "SELECT * FROM gallery_img WHERE gal_id='$gal_id' AND gi_status=1 ORDER BY gi_id ASC";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## jurnalis detail
$app->get("/jurnalis/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $name = $params['name'];

  $sql = "SELECT * FROM journalist WHERE slug='$name'";
  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetch();

  if (!empty($result["id"])) {
    return $response->withJson(["status" => "success", "data" => $result], 200);
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
});

## editor detail
$app->get("/editor/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $name = $params['name'];

  $sql = "SELECT * FROM editor WHERE editor_alias='$name'";
  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetch();

  if (!empty($result["editor_id"])) {
    return $response->withJson(["status" => "success", "data" => $result], 200);
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
});

## all ekoran
$app->get("/all_ekoran/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $news_type = $params['news_type']; ## all, cat, ...
  $offset = $params['offset'];
  $limit = $params['limit'];
  $news_id = $params['news_id'];

  if ($news_type == 'othernews') {
    $addwhere = "id NOT IN (" . $news_id . ") AND ";
    $addorder = "created DESC";
  } else {
    $addwhere = "";
    $addorder = "created DESC";
  }

  $value = "";
  $sql = "SELECT
            *,
            CONCAT('/read/ekoran/',id) as urlPath,
            CONCAT('/ekoran/',id,'/',LOWER(REPLACE(REGEXP_REPLACE(title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci4
          FROM ekoran
          WHERE
            $addwhere
            datepub >= '2015-01-01 00:00:00' AND
            datepub <= NOW() AND
            status = 1
          ORDER BY
            $addorder
          LIMIT $offset, $limit";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response
    ->withHeader('Access-Control-Allow-Origin', '*')
    ->withJson(["status" => "success", "data" => $result], 200);
});

## foto detail
$app->get("/koran_detail/{id}", function (Request $request, Response $response, $args) {
  global $is_view;

  $id = $args["id"];
  $sql = "SELECT
            *,
            CONCAT('/read/koran/',id) as urlPath,
            CONCAT('/ekoran/',id,'/',LOWER(REPLACE(REGEXP_REPLACE(title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci4
          FROM ekoran
          WHERE
            id=:id AND
            status = 1";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":id" => $id]);
  $result = $stmt->fetch();

  if (!empty($result["id"])) {

    ## update viewer
    $sql = "UPDATE ekoran SET views=views+$is_view WHERE id=:id";
    $stmt = $this->db->prepare($sql);
    $stmt->execute([":id" => $id]);

    // return $response->withJson(["status" => "success", "data" => $result], 200);
    // new
    $newResponse = $response->withHeader('Cache-Control', 'public, max-stale=604800')->withJson(["status" => "success", "data" => $result], 200);
    return $newResponse;
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
  // return $response->withJson(["status" => "success", "data" => $result], 200);
});

## ekoran extras g20
$app->get("/ekoran_rd/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $news_type = $params['news_type']; ## all, cat, ...
  $offset = $params['offset'];
  $limit = $params['limit'];
  $news_id = $params['news_id'];

  if ($news_type == 'othernews') {
    $addwhere = "id NOT IN (" . $news_id . ") AND ";
    $addorder = "created DESC";
  } else {
    $addwhere = "";
    $addorder = "created DESC";
  }

  $value = "";
  $sql = "SELECT
            id, datepub, title, created,
            img16 AS extras_1, img17 AS extras_2, img18 AS extras_3, img19 AS extras_4,img20 AS extras_5, img21 AS extras_6, img22 AS extras_7,
            CONCAT('/read/ekoran/',id) as urlPath
          FROM ekoran
          WHERE
            $addwhere
            datepub >= '2022-10-01 00:00:00' AND
            datepub <= NOW() AND
            status = 1
          ORDER BY
            $addorder
          LIMIT $offset, $limit";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## ekoran extras worldcup2022
$app->get("/ekoran_wc22/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $news_type = $params['news_type']; ## all, cat, ...
  $offset = $params['offset'];
  $limit = $params['limit'];
  $news_id = $params['news_id'];

  if ($news_type == 'othernews') {
    $addwhere = "id NOT IN (" . $news_id . ") AND ";
    $addorder = "created DESC";
  } else {
    $addwhere = "";
    $addorder = "created DESC";
  }

  $value = "";
  $sql = "SELECT
            id, datepub, title, created,
            img20 AS extras_1, img21 AS extras_2, img22 AS extras_3,
            CONCAT('/read/ekoran/',id) as urlPath
          FROM ekoran
          WHERE
            $addwhere
            datepub >= '2022-11-21 00:00:00' AND
            datepub <= NOW() AND
            status = 1
          ORDER BY
            $addorder
          LIMIT $offset, $limit";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## all quick count
$app->get("/quickqount/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $reg = $params['reg']; ## all, cat, ...

  $value = "";
  $sql = "SELECT
            *
          FROM qc_member
          WHERE
            id_reg = '$reg'
          ORDER BY
            id ASC";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## detail regional quick count
$app->get("/quickqount_reg/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $name = $params['name'];

  $sql = "SELECT * FROM qc_reg WHERE slug='$name'";
  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetch();

  if (!empty($result["id"])) {
    return $response->withJson(["status" => "success", "data" => $result], 200);
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
});

## detail category quick count
$app->get("/quickqount_cat/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $id = $params['id'];

  $sql = "SELECT * FROM qc_cat ORDER BY id ASC";
  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();

  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## foto detail
$app->get("/master/", function (Request $request, Response $response, $args) {

  $sql = "SELECT * FROM master WHERE id=1";
  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetch();

  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## news detail by is_code
$app->get("/news_detail/code/{is_code}", function (Request $request, Response $response, $args) {
  $is_code = $args["is_code"];

  $sql = "SELECT
            is_code,
            CONCAT('/read/',news_id,'/',date_format(news_datepub, '%Y%m%d'),'/',date_format(news_datepub, '%H%i%s'),'/',LOWER(REPLACE(REGEXP_REPLACE(news_title,'[^a-zA-Z0-9 ]',''), ' ', '-')),'/') as urlPath,
            CONCAT('/read/news/',news_id,'/',LOWER(REPLACE(REGEXP_REPLACE(news_title,'[^a-zA-Z0-9 ]',''), ' ', '-'))) as url_ci
          FROM news
          WHERE is_code=:is_code AND news_status = 1";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":is_code" => $is_code]);
  $result = $stmt->fetch();

  if (!empty($result["is_code"])) {
    return $response->withJson(["status" => "success", "data" => $result], 200);
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
});

## page detail
$app->get("/page/detail/{slug}", function (Request $request, Response $response, $args) {
  $slug = $args["slug"];

  $sql = "SELECT
            *,
            CONCAT('/page/',page_slug) as urlPath
          FROM page
          WHERE page_slug=:slug";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":slug" => $slug]);
  $result = $stmt->fetch();

  if (!empty($result["page_id"])) {
    return $response->withJson(["status" => "success", "data" => $result], 200);
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
});

## ads locate master
$app->get("/ad/locate/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();
  $type = $params['type'];

  $sql = "SELECT * FROM ad_locate_master WHERE type='$type' AND is_status=1 ORDER BY is_page ASC, name";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  $rows = $stmt->rowCount();

  if ($rows > 0) {
    return $response->withJson(["status" => TRUE, "data" => $result], 200);
  } else {
    return $response->withJson(["status" => FALSE, "data" => $result], 200);
  }
});

## ads view
$app->get("/ads/view/{net_id}/{locate}", function (Request $request, Response $response, $args) {
  date_default_timezone_set("Asia/Jakarta");
  global $is_execute;

  $action = '1'; ## action 1=view, 2=click
  $net_id = $args['net_id'];
  $locate = $args['locate'];

  $sql = "SELECT
            a.*,
            c.is_views,
            c.is_clicks,
            e.cost_end
          FROM ad_list a
            JOIN ad_network b ON (b.ads_id=a.id)
            LEFT JOIN ad_locate c ON (c.ads_id=a.id)
            LEFT JOIN ad_locate_master d ON (d.id=c.locate_id)
            LEFT JOIN ad_cost e ON (e.ads_id=a.id)
          WHERE
            b.net_id=:net_id AND
            c.locate_id=:locate AND
            a.is_status=1 AND
            a.datestart <= CURDATE() AND
            a.dateend >= CURDATE()
          ORDER BY a.datestart DESC
          LIMIT 1";

  $stmt = $this->db->prepare($sql);
  $stmt->execute([":net_id" => $net_id, ":locate" => $locate]);
  $result = $stmt->fetch();
  // $this->db = null;

  if ($is_execute == 1) {
    if (!empty($result["id"])) {

      $ads_id = $result["id"];
      $cpc = ($result["cpc"] / 3);

      ## update viewer
      $sql = "UPDATE ad_locate SET is_views=is_views+1 WHERE ads_id=:ads_id AND locate_id=:locate";
      $stmt = $this->db->prepare($sql);
      $execute = $stmt->execute([":ads_id" => $ads_id, ":locate" => $locate]);

      ## update cost
      $sql_cost = "UPDATE ad_cost SET cost_end=cost_end - :cpc WHERE ads_id=:ads_id";
      $stmt_cost = $this->db->prepare($sql_cost);
      $exe_cost = $stmt_cost->execute([":ads_id" => $ads_id, ":cpc" => $cpc]);

      if ($execute && $exe_cost) {
        return $response->withJson(["status" => "success", "data" => $result], 200);
      } else {
        return $response->withJson(["status" => "failed_insert", "data" => "0"], 200);
      }
    }

    return $response->withJson(["status" => "failed", "data" => "0"], 200);
  } else {
    if (!empty($result["id"])) {
      return $response->withJson(["status" => "success", "data" => $result], 200);
    }
    return $response->withJson(["status" => "failed", "data" => "0"], 200);
  }
});

## ads click
$app->get("/ads/click/{unique_id}/{locate}", function (Request $request, Response $response, $args) {
  date_default_timezone_set("Asia/Jakarta");
  global $is_execute;

  $unique_id = $args['unique_id'];
  $locate = $args['locate'];

  $sql = "SELECT * FROM ad_list WHERE unique_id=:unique_id AND is_status=1";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":unique_id" => $unique_id]);
  $result = $stmt->fetch();

  if ($is_execute == 1) {
    if (!empty($result["id"])) {

      ## update click
      $ads_id = $result["id"];
      $sql = "UPDATE ad_locate SET is_clicks=is_clicks+1 WHERE ads_id=:ads_id AND locate_id=:locate";
      $stmt = $this->db->prepare($sql);
      $execute = $stmt->execute([":ads_id" => $ads_id, ":locate" => $locate]);

      if ($execute) {
        return $response->withJson(["status" => "success", "data" => $result], 200);
      } else {
        return $response->withJson(["status" => "failed_insert", "data" => "0"], 200);
      }
    }

    return $response->withJson(["status" => "failed", "data" => "0"], 200);
  } else {
    if (!empty($result["id"])) {
      return $response->withJson(["status" => "success", "data" => $result], 200);
    }
    return $response->withJson(["status" => "failed", "data" => "0"], 200);
  }
});

## list kanal
$app->get("/kanal/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $offset = $params['offset'];
  $limit = $params['limit'];

  $sql = "SELECT
            catnews_id AS id,
            catnews_title AS name,
            catnews_slug AS slug,
            CONCAT('/kanal/',catnews_slug) as url
          FROM news_category WHERE catnews_status=1 ORDER BY catnews_order";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});


## list tags
$app->get("/list_tags/", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();

  $offset = $params['offset'];
  $limit = $params['limit'];

  $sql = "SELECT news_id AS id, GROUP_CONCAT(news_tags SEPARATOR ', ') AS tags FROM `news` WHERE news_status=1 GROUP BY news_id ORDER BY news_datepub DESC LIMIT 20";

  $stmt = $this->db->prepare($sql);
  $stmt->execute();
  $result = $stmt->fetchAll();
  return $response->withJson(["status" => "success", "data" => $result], 200);
});

## pageviews news
$app->get("/news_pv/{id}", function (Request $request, Response $response, $args) {
  global $is_view;
  $id = $args["id"];
  $sql = "UPDATE news SET news_view=news_view+$is_view WHERE news_id=:id";
  $stmt = $this->db->prepare($sql);
  if ($stmt->execute([":id" => $id])) {
    return $response->withJson(["status" => "success", "data" => "0"], 200);
  } else {
    return $response->withJson(["status" => "failed", "data" => "0"], 200);
  }
});

## pageviews news v2
$app->get("/news_pageviews/{id}", function (Request $request, Response $response, $args) {
  global $is_view;

  $id = $args["id"];
  $sql = "SELECT news_id,pageviews FROM news_views WHERE news_id=:id";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":id" => $id]);
  $result = $stmt->fetch();

  if (!empty($result["news_id"])) {

    ## update viewer
    $sqlUpdate = "UPDATE news_views SET pageviews=pageviews+$is_view WHERE news_id=:id";
    $stmtUpdate = $this->db->prepare($sqlUpdate);
    $stmtUpdate->execute([":id" => $id]);

    return $response->withJson(["status" => "success", "data" => $result], 200);
  } else {
    ## create news_id + update pageviews
    $sqlUpdate = "INSERT INTO news_views (id, news_id, pageviews) VALUES (NULL, :id, $is_view)";
    $stmtUpdate = $this->db->prepare($sqlUpdate);
    $stmtUpdate->execute([":id" => $id]);

    $sqlUpdateGet = "SELECT news_id,pageviews FROM news_views WHERE news_id=:id";
    $stmtUpdateGet = $this->db->prepare($sqlUpdateGet);
    $stmtUpdateGet->execute([":id" => $id]);
    $resultUpdateGet = $stmtUpdateGet->fetch();

    return $response->withJson(["status" => "success", "data" => $resultUpdateGet], 200);
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
});

## pageviews news v2 - select
$app->get("/news_pageviews_get/{id}", function (Request $request, Response $response, $args) {
  global $is_view;

  $id = $args["id"];
  $sql = "SELECT news_id,pageviews FROM news_views WHERE news_id=:id";
  $stmt = $this->db->prepare($sql);
  $stmt->execute([":id" => $id]);
  $result = $stmt->fetch();

  if (!empty($result["news_id"])) {
    return $response->withJson(["status" => "success", "data" => $result], 200);
  }

  return $response->withJson(["status" => "failed", "data" => "0"], 200);
});
