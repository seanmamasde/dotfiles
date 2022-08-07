# API metadata files

This folder contains CSV files that are exported using PLX scripts from DRIFT
database.

To generate the `products.csv` file, run the query below:

```sql
select p1.id, p1.display_name as title, p1.docs_root_url as doc_url, p1.launch_stage as release_level, p2.display_name as category
from cloud_devrel_infra.prod.products p1, cloud_devrel_infra.prod.products p2
where p1.parent_id = p2.id and p1.id in (296,89,48,63,48,33,33,14,9,34,292,110,56,196,50,54,21,286,19,98,205,2,3,5,4,8,225,46,49,55,58,74,101,17,16,90,134,12,70,60,10,187,91,111,106,106,106,105,13,311,20,271);
```

To generate the `libraries.csv` file, run the query below:

```sql
select DISTINCT
  l1.product_id AS productId,
  l1.language AS language,
  l1.pkg_name AS packageName,
  l1.launch_stage AS version,
  l1.docs_url AS referenceUrl
FROM cloud_devrel_infra.prod.libraries.latest l1
WHERE l1.product_id in (296,89,48,63,48,33,33,14,9,34,292,110,56,196,50,54,21,286,19,98,205,2,3,5,4,8,225,46,49,55,58,74,101,17,16,90,134,12,70,60,10,187,91,111,106,106,106,105,13,311,20,271)
AND l1.language IN ("NODEJS", "PYTHON", "JAVA", "GO")
ORDER BY packageName ASC
```

Our scope is only those APIs shown in [here](https://cloud.google.com/apis/)

Refer to
[this list](https://docs.google.com/document/d/1KIF6t-FtAgk4MUgiO9VnTkJe9U09PHBTVuqgEn5KjAw/edit#bookmark=id.56w2nr85men9)
