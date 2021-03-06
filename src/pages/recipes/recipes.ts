import { Component } from '@angular/core';
import { IonicPage, NavController, PopoverController, LoadingController, AlertController } from 'ionic-angular';

import { EditRecipePage } from '../edit-recipe/edit-recipe';
import { RecipePage } from '../recipe/recipe';
import { DatabaseOptionsPage } from '../database-options/database-options';
import { RecipesService } from '../../services/recipes';
import { AuthService } from '../../services/auth';
import { Recipe } from '../../models/recipe';

@IonicPage()
@Component({
  selector: 'page-recipes',
  templateUrl: 'recipes.html',
})
export class RecipesPage {
  recipes: Recipe[];

  constructor(private navCtrl: NavController,
              private popoverCtrl: PopoverController,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private recipesService: RecipesService,
              private authService: AuthService) {}

  ionViewWillEnter() {
    this.recipes = this.recipesService.getRecipes();
  }

  onNewRecipe() {
    this.navCtrl.push(EditRecipePage, {mode: 'New'});
  }

  onLoadRecipe(recipe: Recipe, index: number) {
    this.navCtrl.push(RecipePage, {recipe: recipe, index: index});
  }

  onShowOptions(event: MouseEvent) {
    const loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    const popover = this.popoverCtrl.create(DatabaseOptionsPage);
    popover.present({ev: event});

    popover.onDidDismiss((data) => {
      if (!data) {
        return;
      }

      if(data.action == 'load') {
        loading.present();
        this.authService.getActiveUser().getIdToken()
          .then((token: string) => {
            this.recipesService.fetchList(token).subscribe(
              (recipes: Recipe[]) => {
                loading.dismiss();
                if(recipes) {
                  this.recipes = recipes;
                } else {
                  this.recipes = [];
                }
                console.log('Success!');
              },
              error => {
                loading.dismiss();
                this.handleError(error.message);
              }
            );
          });
      } else if(data.action == 'store') {
        loading.present();
        this.authService.getActiveUser().getIdToken()
          .then((token: string) => {
            this.recipesService.storeList(token).subscribe(
              () => {
                loading.dismiss();
                console.log('Success!');
              },
              error => {
                loading.dismiss();
                this.handleError(error.message);
              }
            );
          });
      }
    })
  }

  private handleError(errorMessage: string) {
    const alert = this.alertCtrl.create({
      title: 'An error occurred!',
      message: errorMessage,
      buttons: ['Ok']
    });
    alert.present();
  }
}
