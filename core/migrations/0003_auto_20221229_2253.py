# Generated by Django 3.0.1 on 2022-12-30 03:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_auto_20221229_2151'),
    ]

    operations = [
        migrations.AlterField(
            model_name='artifact',
            name='type',
            field=models.CharField(choices=[('MULTIESPECTRAL', 'Multiespectral'), ('SHAPEFILE', 'Shapefile'), ('INDEX', 'Index'), ('RGB', 'RGB'), ('KML', 'Kml')], max_length=20),
        ),
    ]
