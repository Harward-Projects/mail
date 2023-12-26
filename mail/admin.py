from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Register your models here.
from .models import User, Email


class EmailAdmin(admin.ModelAdmin):
    list_display = (
        "sender",
        "subject",
        "body",
        "timestamp",
    )  # Add fields you want to display in the list view


# Register the User model
admin.site.register(User, UserAdmin)

# Register the Email model
admin.site.register(Email, EmailAdmin)
