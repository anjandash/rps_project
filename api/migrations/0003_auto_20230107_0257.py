# Generated by Django 3.2.16 on 2023-01-07 02:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_auto_20230107_0237'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='guest',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='game',
            name='guest_choice',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='game',
            name='host_choice',
            field=models.CharField(max_length=50, null=True),
        ),
    ]