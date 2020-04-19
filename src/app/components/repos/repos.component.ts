import { RepositoryService } from './../../services/repository.service';
import { Component, OnInit, ViewChild, Input, OnChanges, DoCheck, AfterViewChecked, AfterContentInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { GithubAPI } from 'src/app/models/github-api';
import { merge, Observable, of as observableOf } from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';


@Component({
  selector: 'app-repos',
  templateUrl: './repos.component.html',
  styleUrls: ['./repos.component.css']
})
export class ReposComponent implements OnInit, OnChanges, AfterContentInit {

  ELEMENT_DATA: GithubAPI[] = []
  resultsLength: number = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  constructor(private api: RepositoryService) { }

  displayedColumns: string[] = ['name', 'owner', 'type', 'created_at', 'stargazers_count', 'open_issues_count', 'forks_count', 'language', 'size', 'actions'];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA) || null;
  
  

  @Input('data') data = {
    sortDate: new Date(),
    sortValue: 'stars'
  }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;    
    this.init();
  }

  /**
   * fetching data with default infos in loading of page
   */
  ngAfterContentInit(): void {

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.fetch()
  }

  /**
   *  fetching data after any submit of form with new infos
   */
  ngOnChanges(): void {
    // this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    console.log(this.data);
    
    this.fetch()
    this.init()
  }
  

  // filter(filterText: String) {
  //   this.dataSource.filter = filterText.trim().toLocaleLowerCase();
  // }
  // show(element) {
  //   console.log(element);
    
  // }

  init() {
    this.data = {
      sortDate: new Date(),
      sortValue: "stars"
    }
  }

  fetch() {
    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        
        return this.api!._getRepos(
          "2020-03-19", 
          this.data.sortValue, this.sort.direction || 'desc', 
          this.paginator.pageIndex
        );
      }),
      map(data => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        this.isRateLimitReached = false;
        this.resultsLength = data.total_count;        

        return data.items;
      }),
      catchError((err) => {
        this.isLoadingResults = false;
        // Catch if the GitHub API has reached its rate limit. Return empty data.
        this.isRateLimitReached = true;
        return observableOf([]);
      })
    ).subscribe(data => {      
      this.dataSource = new MatTableDataSource(data);
      
    });
  }

  formateDate(): string {
    // {year: "numeric", month: "2-digit", day: "2-digit"}
    let year = this.data.sortDate.getFullYear();
    let mounth = this.data.sortDate.getMonth();
    let day = this.data.sortDate.getDate()
    return `${year}-0${mounth + 1}-0${day}`
  }

}